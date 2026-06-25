#!/usr/bin/env python3
"""
Build a derived Solution Architect thinking prompt from a YouTube playlist.

This script is intentionally separate from the ArchitectIQ application code.
It does not edit server.js, ArchitectIQ.html, or frontend files.

Install dependencies:
  pip install youtube-transcript-api yt-dlp

For LLM-based extraction, set one provider key and a current model:
  set ANTHROPIC_API_KEY=...
  set ANTHROPIC_MODEL=...
  set OPENAI_API_KEY=...
  set OPENAI_MODEL=...

Example:
  python tools/solution_architect_intelligence/extract_solution_architect_prompt.py ^
    --playlist "https://youtube.com/playlist?list=PLrtCHHeadkHqhuz-bwUiGbmdUnN4eonZ2" ^
    --current-prompt-file ArchitectIQ.html ^
    --out-dir tools/solution_architect_intelligence/out

Copyright note:
  By default this script does not save full raw transcripts. It transforms
  transcript content into short, original architecture principles, checks, and
  prompt guidance. Use --save-raw-transcripts only for private review where you
  have the right to store those transcripts.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DEFAULT_PLAYLIST = "https://youtube.com/playlist?list=PLrtCHHeadkHqhuz-bwUiGbmdUnN4eonZ2"
DEFAULT_OPENAI_MODEL = ""
DEFAULT_ANTHROPIC_MODEL = ""
MAX_CHARS_PER_CHUNK = 18_000


@dataclass
class VideoInfo:
    video_id: str
    title: str
    url: str


def die(message: str, code: int = 1) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(code)


def require_module(module_name: str, install_name: str | None = None) -> Any:
    try:
        return __import__(module_name)
    except ImportError:
        package = install_name or module_name
        die(f"Missing dependency '{package}'. Install it with: pip install {package}")


def extract_playlist_id(playlist: str) -> str:
    parsed = urllib.parse.urlparse(playlist)
    qs = urllib.parse.parse_qs(parsed.query)
    if qs.get("list"):
        return qs["list"][0]
    if playlist.startswith("PL"):
        return playlist
    die("Could not find a YouTube playlist id. Pass the full playlist URL or the PL... id.")


def fetch_playlist_videos(playlist: str, limit: int | None = None) -> list[VideoInfo]:
    yt_dlp = require_module("yt_dlp")
    options = {
        "extract_flat": "in_playlist",
        "quiet": True,
        "skip_download": True,
        "ignoreerrors": True,
    }
    with yt_dlp.YoutubeDL(options) as ydl:
        data = ydl.extract_info(playlist, download=False)
    entries = [e for e in (data.get("entries") or []) if e]
    videos: list[VideoInfo] = []
    for entry in entries[:limit]:
        video_id = entry.get("id")
        if not video_id:
            continue
        title = entry.get("title") or video_id
        videos.append(
            VideoInfo(
                video_id=video_id,
                title=title,
                url=f"https://www.youtube.com/watch?v={video_id}",
            )
        )
    return videos


def fetch_transcript(video_id: str, languages: list[str]) -> str:
    ytt = require_module("youtube_transcript_api", "youtube-transcript-api")
    api = ytt.YouTubeTranscriptApi()

    try:
        rows = api.fetch(video_id, languages=languages)
    except Exception:
        transcript_list = api.list(video_id)
        transcript = None
        for lang in languages:
            try:
                transcript = transcript_list.find_transcript([lang])
                break
            except Exception:
                continue
        if transcript is None:
            transcript = transcript_list.find_generated_transcript(languages)
        rows = transcript.fetch()

    parts = []
    for row in rows:
        if isinstance(row, dict):
            text = row.get("text", "")
        else:
            text = getattr(row, "text", "")
        text = text.replace("\n", " ").strip()
        if text:
            parts.append(text)
    return normalize_whitespace(" ".join(parts))


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def chunk_text(text: str, max_chars: int = MAX_CHARS_PER_CHUNK) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        split_at = text.rfind(". ", start, end)
        if split_at <= start + 1_000:
            split_at = end
        chunks.append(text[start:split_at].strip())
        start = split_at + 1
    return [c for c in chunks if c]


def post_openai_response(api_key: str, model: str, instructions: str, input_text: str, max_tokens: int) -> str:
    payload = {
        "model": model,
        "instructions": instructions,
        "input": input_text,
        "max_output_tokens": max_tokens,
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return extract_openai_text(data)


def post_anthropic_response(api_key: str, model: str, instructions: str, input_text: str, max_tokens: int) -> str:
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "system": instructions,
        "messages": [{"role": "user", "content": input_text}],
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    texts: list[str] = []
    for content in data.get("content", []) or []:
        if content.get("type") == "text" and isinstance(content.get("text"), str):
            texts.append(content["text"])
    return "\n".join(texts).strip()


def post_llm_response(
    provider: str,
    api_key: str,
    model: str,
    instructions: str,
    input_text: str,
    max_tokens: int,
) -> str:
    if provider == "anthropic":
        return post_anthropic_response(api_key, model, instructions, input_text, max_tokens)
    if provider == "openai":
        return post_openai_response(api_key, model, instructions, input_text, max_tokens)
    raise ValueError(f"Unsupported provider: {provider}")


def extract_openai_text(data: dict[str, Any]) -> str:
    if isinstance(data.get("output_text"), str):
        return data["output_text"]
    texts: list[str] = []
    for item in data.get("output", []) or []:
        for content in item.get("content", []) or []:
            if content.get("type") in {"output_text", "text"} and isinstance(content.get("text"), str):
                texts.append(content["text"])
    return "\n".join(texts).strip()


def parse_json_loose(text: str) -> Any:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\}|\[.*\])", text, flags=re.S)
        if match:
            return json.loads(match.group(1))
        raise


def extract_thinking_from_chunk(
    provider: str,
    api_key: str,
    model: str,
    video: VideoInfo,
    chunk: str,
    chunk_index: int,
) -> dict[str, Any]:
    instructions = (
        "You extract reusable Solution Architect reasoning patterns from transcript text. "
        "Do not quote or closely paraphrase the transcript. Do not include copyrighted wording. "
        "Ignore vendor-specific implementation unless it reveals a general architecture decision rule. "
        "Return only valid JSON."
    )
    input_text = f"""
Video title: {video.title}
Chunk: {chunk_index}

Extract the thinking of a senior Solution Architect from the transcript chunk below.

Return JSON with these keys:
- principles: array of short original principles
- discovery_questions: array of stakeholder questions an architect should ask
- tradeoff_rules: array of cost/security/scalability/delivery trade-off rules
- validation_checks: array of checks to apply before client delivery
- anti_patterns: array of recommendations a senior architect would avoid
- output_quality_bar: array of traits that make the output feel senior architect grade
- mining_industrial_relevance: array of principles relevant to mining, industrial, OT/IT, remote sites, resilience, or safety

Each item must be original, concise, and no more than 28 words.

Transcript chunk:
{chunk}
"""
    raw = post_llm_response(provider, api_key, model, instructions, input_text, max_tokens=3000)
    parsed = parse_json_loose(raw)
    if not isinstance(parsed, dict):
        raise ValueError("Chunk extraction did not return a JSON object.")
    return parsed


def dedupe(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        clean = normalize_whitespace(str(item))
        key = re.sub(r"[^a-z0-9]+", " ", clean.lower()).strip()
        if clean and key not in seen:
            seen.add(key)
            out.append(clean)
    return out


def combine_findings(findings: list[dict[str, Any]]) -> dict[str, list[str]]:
    keys = [
        "principles",
        "discovery_questions",
        "tradeoff_rules",
        "validation_checks",
        "anti_patterns",
        "output_quality_bar",
        "mining_industrial_relevance",
    ]
    combined: dict[str, list[str]] = {k: [] for k in keys}
    for finding in findings:
        for key in keys:
            values = finding.get(key) or []
            if isinstance(values, list):
                combined[key].extend(str(v) for v in values)
    return {k: dedupe(v) for k, v in combined.items()}


def cap_combined_findings(combined: dict[str, list[str]], max_items: int) -> dict[str, list[str]]:
    return {key: values[:max_items] for key, values in combined.items()}


def synthesize_prompt(provider: str, api_key: str, model: str, combined: dict[str, list[str]]) -> str:
    instructions = (
        "You are creating an original system prompt fragment for ArchitectIQ. "
        "Use only derived principles, not transcript wording. "
        "Do not mention YouTube, playlists, videos, transcripts, or source creators. "
        "Return Markdown only. "
        "Do not hardcode dated model names, service versions, prices, or product claims as permanently current. "
        "Use capability-based guidance and require runtime verification for current products, models, regions, limits, compliance status, and pricing."
    )
    input_text = f"""
Create a system prompt fragment named "Solution Architect Thinking Layer" for ArchitectIQ.

ArchitectIQ generates solution architecture recommendations. The fragment should make the model reason like a senior Solution Architect.

Use these extracted findings:
{json.dumps(combined, indent=2)}

Requirements:
- Make it actionable as model instructions.
- Cover discovery, business context, NFRs, trade-offs, risk, security, data, cloud, DevOps, delivery, governance, and stakeholder communication.
- Include a mining/industrial architecture lens for remote sites, OT/IT, safety-critical operations, poor connectivity, edge processing, resilience, and data movement.
- Include validation instructions that a human Solution Architect can approve or reject.
- Do not include vendor-specific bias.
- Do not include any transcript quotes.
- Separate hard constraints from examples that must be verified at runtime.
- Avoid static claims that a model, product, price, region, or limit is current forever.
"""
    return post_llm_response(provider, api_key, model, instructions, input_text, max_tokens=6000)

def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def extract_current_system_prompt(path: Path) -> str | None:
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r"const\s+SYSTEM_PROMPT\s*=\s*`(?P<prompt>.*?)`;", text, flags=re.S)
    if not match:
        return None
    prompt = match.group("prompt")
    prompt = prompt.replace("\\`", "`").replace("\\n", "\n")
    return prompt.strip()


def write_markdown_list(title: str, items: list[str]) -> str:
    if not items:
        return f"## {title}\n\n_No items extracted._\n"
    body = "\n".join(f"- {item}" for item in items)
    return f"## {title}\n\n{body}\n"


def build_findings_markdown(combined: dict[str, list[str]]) -> str:
    sections = [
        ("Principles", combined.get("principles", [])),
        ("Discovery Questions", combined.get("discovery_questions", [])),
        ("Trade-off Rules", combined.get("tradeoff_rules", [])),
        ("Validation Checks", combined.get("validation_checks", [])),
        ("Anti-patterns", combined.get("anti_patterns", [])),
        ("Output Quality Bar", combined.get("output_quality_bar", [])),
        ("Mining / Industrial Relevance", combined.get("mining_industrial_relevance", [])),
    ]
    intro = (
        "# Derived Solution Architect Thinking Notes\n\n"
        "These are derived architecture principles, not transcripts. Use them as raw input for a curated playbook. "
        "Not every extracted item belongs in the runtime prompt; prefer durable reasoning, validation checks, trade-off rules, and anti-patterns.\n\n"
    )
    return intro + "\n".join(write_markdown_list(title, items) for title, items in sections)

def load_checkpoint(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    findings: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            finding = json.loads(line)
            if isinstance(finding, dict):
                findings.append(finding)
        except json.JSONDecodeError:
            continue
    return findings


def append_checkpoint(path: Path, finding: dict[str, Any]) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(finding, ensure_ascii=True) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract Solution Architect thinking into a derived prompt.")
    parser.add_argument("--playlist", default=DEFAULT_PLAYLIST, help="YouTube playlist URL or playlist id.")
    parser.add_argument("--out-dir", default="tools/solution_architect_intelligence/out", help="Output directory.")
    parser.add_argument("--current-prompt-file", default="ArchitectIQ.html", help="File containing const SYSTEM_PROMPT.")
    parser.add_argument("--provider", choices=["anthropic", "openai"], default=None, help="LLM provider.")
    parser.add_argument("--model", default=None, help="Model for extraction and synthesis.")
    parser.add_argument("--env-file", default=".env", help="Optional .env file to load API keys from.")
    parser.add_argument("--limit", type=int, default=None, help="Optional max number of videos to process.")
    parser.add_argument("--languages", default="en,en-US,en-GB", help="Comma-separated transcript language preferences.")
    parser.add_argument("--save-raw-transcripts", action="store_true", help="Save raw transcripts for private review.")
    parser.add_argument("--sleep", type=float, default=0.4, help="Seconds to sleep between API calls.")
    parser.add_argument("--max-items-per-section", type=int, default=90, help="Cap extracted items sent to final synthesis.")
    args = parser.parse_args()

    load_dotenv(Path(args.env_file))
    provider = args.provider
    if provider is None:
        provider = "anthropic" if os.environ.get("ANTHROPIC_API_KEY") else "openai"
    if provider == "anthropic":
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        model = args.model or os.environ.get("ANTHROPIC_MODEL") or DEFAULT_ANTHROPIC_MODEL
    else:
        api_key = os.environ.get("OPENAI_API_KEY")
        model = args.model or os.environ.get("OPENAI_MODEL") or DEFAULT_OPENAI_MODEL
    if not api_key:
        die(f"{provider.upper()} API key is required to transform transcripts into a derived prompt.")
    if not model:
        die(f"A current {provider.upper()} model is required. Pass --model or set {provider.upper()}_MODEL in the environment.")

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    raw_dir = out_dir / "raw_transcripts"
    if args.save_raw_transcripts:
        raw_dir.mkdir(parents=True, exist_ok=True)
    notes_path = out_dir / "derived_solution_architect_thinking_notes.md"
    fragment_path = out_dir / "solution_architect_thinking_layer.md"
    merged_path = out_dir / "architectiq_system_prompt_merged.md"
    summary_path = out_dir / "extraction_summary.json"
    checkpoint_path = out_dir / "chunk_findings.jsonl"

    playlist_id = extract_playlist_id(args.playlist)
    videos = fetch_playlist_videos(args.playlist, limit=args.limit)
    if not videos:
        die("No videos found in playlist.")

    languages = [x.strip() for x in args.languages.split(",") if x.strip()]
    all_findings: list[dict[str, Any]] = load_checkpoint(checkpoint_path)
    processed = {
        (str(f.get("_video_id")), int(f.get("_chunk", 0)))
        for f in all_findings
        if f.get("_video_id") and f.get("_chunk")
    }
    failures: list[dict[str, str]] = []

    for idx, video in enumerate(videos, start=1):
        print(f"[{idx}/{len(videos)}] {video.title}")
        try:
            transcript = fetch_transcript(video.video_id, languages)
            if args.save_raw_transcripts:
                (raw_dir / f"{video.video_id}.txt").write_text(transcript, encoding="utf-8")
            chunks = chunk_text(transcript)
            for chunk_index, chunk in enumerate(chunks, start=1):
                if (video.video_id, chunk_index) in processed:
                    print(f"  chunk {chunk_index}: checkpoint exists")
                    continue
                finding = extract_thinking_from_chunk(provider, api_key, model, video, chunk, chunk_index)
                finding["_video_id"] = video.video_id
                finding["_title"] = video.title
                finding["_chunk"] = chunk_index
                all_findings.append(finding)
                processed.add((video.video_id, chunk_index))
                append_checkpoint(checkpoint_path, finding)
                time.sleep(args.sleep)
        except Exception as exc:
            failures.append({"video_id": video.video_id, "title": video.title, "error": str(exc)})
            print(f"  skipped: {exc}", file=sys.stderr)

    if not all_findings:
        die("No transcript findings were extracted.")

    combined = combine_findings(all_findings)
    notes_path.write_text(build_findings_markdown(combined), encoding="utf-8")
    synthesis_input = cap_combined_findings(combined, args.max_items_per_section)
    prompt_fragment = synthesize_prompt(provider, api_key, model, synthesis_input)
    fragment_path.write_text(prompt_fragment.strip() + "\n", encoding="utf-8")

    current_prompt = extract_current_system_prompt(Path(args.current_prompt_file))
    if current_prompt:
        merged = (
            current_prompt
            + "\n\n---\n\n"
            + "# Solution Architect Thinking Layer\n\n"
            + prompt_fragment.strip()
            + "\n"
        )
        merged_path.write_text(merged, encoding="utf-8")

    summary = {
        "playlist_id": playlist_id,
        "playlist": args.playlist,
        "provider": provider,
        "model": model,
        "videos_found": len(videos),
        "chunks_processed": len(all_findings),
        "failures": failures,
        "outputs": {
            "notes": str(notes_path),
            "prompt_fragment": str(fragment_path),
            "merged_prompt": str(merged_path) if current_prompt else None,
            "checkpoint": str(checkpoint_path),
        },
        "raw_transcripts_saved": bool(args.save_raw_transcripts),
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print("\nDone.")
    print(f"Notes:           {notes_path}")
    print(f"Prompt fragment: {fragment_path}")
    if current_prompt:
        print(f"Merged prompt:   {merged_path}")
    print(f"Summary:         {summary_path}")


if __name__ == "__main__":
    main()



