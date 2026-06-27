import base64
import json
import os
import re
import sys
import tempfile
from pathlib import Path

from diagrams import Cluster, Diagram, Edge
from diagrams.aws.analytics import ElasticsearchService
from diagrams.aws.compute import AppRunner, ECS, Fargate, Lambda
from diagrams.aws.database import Aurora, DocumentdbMongodbCompatibility, Dynamodb, ElasticacheForRedis, RDS, RDSPostgresqlInstance
from diagrams.aws.integration import Eventbridge, SQS, StepFunctions
from diagrams.aws.management import Cloudwatch, CloudwatchLogs
from diagrams.aws.ml import Bedrock
from diagrams.aws.mobile import Amplify
from diagrams.aws.network import APIGateway, CloudFront
from diagrams.aws.security import Cognito, IAM, KMS, SecretsManager, WAF
from diagrams.aws.storage import S3
from diagrams.generic.compute import Rack
from diagrams.generic.network import Firewall, Router
from diagrams.generic.storage import Storage
from diagrams.onprem.client import Client, Users
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.inmemory import Redis
from diagrams.onprem.monitoring import Grafana
from diagrams.onprem.queue import RabbitMQ
from diagrams.onprem.security import Vault


BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)
IMAGE_HREF_PATTERN = re.compile(r'xlink:href="([^"]+)"')


def safe_text(value, fallback):
    text = str(value or "").strip()
    return text[:80] if text else fallback


def first_non_empty(*values):
    for value in values:
        text = str(value or "").strip()
        if text:
            return text
    return ""


def select_service_label(text, rules, fallback):
    source = str(text or "")
    for pattern, label in rules:
        if re.search(pattern, source, re.IGNORECASE):
            return label
    return safe_text(fallback or source, fallback)


def extract_service_labels(text, rules):
    source = str(text or "")
    found = []
    for pattern, label in rules:
        if re.search(pattern, source, re.IGNORECASE) and label not in found:
            found.append(label)
    return found


def build_visual_facts(facts):
    is_ai = bool(facts.get("isAiScenario", True))
    ui_rec = first_non_empty(facts.get("uiRec"), facts.get("ui"))
    edge_rec = first_non_empty(facts.get("edgeRec"), facts.get("edge"), ui_rec)
    api_rec = first_non_empty(facts.get("apiRec"), facts.get("api"))
    orchestration_rec = first_non_empty(facts.get("orchestrationRec"), facts.get("orchestration"))
    llm_rec = first_non_empty(facts.get("llmRec"), facts.get("llm"))
    vector_rec = first_non_empty(facts.get("vectorRec"), facts.get("vector"))
    database_rec = first_non_empty(facts.get("databaseRec"), facts.get("data"), vector_rec)
    storage_rec = first_non_empty(facts.get("storageRec"), facts.get("store"))
    monitoring_rec = first_non_empty(facts.get("monitoringRec"), facts.get("monitoring"))
    security_rec = first_non_empty(facts.get("securityRec"), facts.get("security"))
    queue_rec = first_non_empty(facts.get("queueRec"), facts.get("queue"))
    cache_rec = " ".join(filter(None, [api_rec, vector_rec, database_rec, storage_rec]))

    trace_candidates = extract_service_labels(monitoring_rec, [
        (r"\blangsmith\b", "LangSmith"),
        (r"\bhelicone\b", "Helicone"),
    ])
    trace_label = trace_candidates[0] if trace_candidates else ("AI telemetry" if not facts.get("hasTrace") else "Tracing")
    monitoring_nodes = facts.get("monitoringServices") or extract_service_labels(monitoring_rec, [
        (r"\bcloudwatch\b", "Amazon CloudWatch"),
        (r"\bdatadog\b", "Datadog"),
        (r"\blangsmith\b", "LangSmith"),
        (r"\bhelicone\b", "Helicone"),
    ])
    monitoring_nodes = [label for label in monitoring_nodes if label != trace_label]
    if not monitoring_nodes:
        monitoring_nodes = [safe_text(facts.get("monitoring"), "Monitoring")]

    security_nodes = facts.get("securityServices") or extract_service_labels(security_rec, [
        (r"\bcognito\b", "Amazon Cognito"),
        (r"\bkms\b|key management service", "AWS KMS"),
        (r"secrets manager", "AWS Secrets Manager"),
        (r"\biam\b", "AWS IAM"),
    ])
    if not security_nodes:
        security_nodes = [safe_text(facts.get("security"), "Security Controls")]

    return {
        "is_ai": is_ai,
        "company": safe_text(facts.get("company"), "Client Platform"),
        "region": safe_text(facts.get("region"), "Primary Region"),
        "ui": select_service_label(ui_rec, [
            (r"\bamplify\b", "AWS Amplify"),
            (r"\bvercel\b", "Vercel Frontend"),
            (r"\bnext(?:\.js)?\b", "Next.js frontend"),
            (r"\breact\b", "React frontend"),
        ], facts.get("ui") or "Frontend"),
        "edge": select_service_label(edge_rec, [
            (r"\bwaf\b", "AWS WAF"),
            (r"\bcloudfront\b", "Amazon CloudFront"),
            (r"\bapi gateway\b", "Amazon API Gateway"),
        ], facts.get("edge") or "Secure Edge"),
        "api": select_service_label(api_rec, [
            (r"\bapp runner\b", "AWS App Runner"),
            (r"\bfargate\b", "AWS Fargate"),
            (r"\becs\b", "Amazon ECS"),
            (r"\blambda\b", "AWS Lambda"),
            (r"\bapi gateway\b", "Amazon API Gateway"),
        ], facts.get("api") or "API Service"),
        "orchestration": select_service_label(orchestration_rec, [
            (r"\blanggraph\b", "LangGraph Runtime"),
            (r"\btemporal\b", "Temporal Workflow"),
            (r"\bstep functions\b", "AWS Step Functions"),
            (r"\bgreengrass\b", "AWS IoT Greengrass edge"),
            (r"\bk3s\b", "k3s Linux store appliance"),
            (r"\blinux\b", "Linux store appliance"),
        ], facts.get("orchestration") or ("Agent Runtime" if is_ai else "Store edge autonomy")),
        "llm": safe_text(facts.get("llm") or llm_rec, "Primary Model" if is_ai else "No AI runtime"),
        "fallback": safe_text(facts.get("fallback"), "Fallback Model" if is_ai else "Not applicable"),
        "trace": safe_text(trace_label, "AI telemetry" if is_ai else "Replay telemetry"),
        "data": safe_text(facts.get("data") or database_rec, "Primary Database"),
        "vector": select_service_label(vector_rec, [
            (r"\bpgvector\b", "pgvector"),
            (r"\bpinecone\b", "Pinecone"),
            (r"\bopensearch\b", "OpenSearch Vector"),
            (r"\bweaviate\b", "Weaviate"),
        ], facts.get("vector") or ("Vector Store" if is_ai else "Inventory projections")),
        "store": select_service_label(storage_rec, [
            (r"\bs3 standard\b", "Amazon S3 Standard"),
            (r"\bs3\b", "Amazon S3"),
            (r"blob storage", "Blob Storage"),
            (r"object storage", "Object Storage"),
        ], facts.get("store") or ("Object Storage" if is_ai else "Immutable audit store")),
        "cache": select_service_label(cache_rec, [
            (r"\belasticache\b.*\bredis\b|\bredis\b", "Amazon ElastiCache for Redis"),
        ], "Cache" if facts.get("hasCache") else "Session Data"),
        "queue": select_service_label(queue_rec, [
            (r"\bmsk\b", "Amazon MSK and CDC"),
            (r"\bkafka\b", "Kafka event backbone"),
            (r"\bnats\b|\bjetstream\b", "NATS JetStream queue"),
            (r"\bsqs\b", "Amazon SQS"),
            (r"\beventbridge\b", "Amazon EventBridge"),
            (r"service bus", "Azure Service Bus"),
            (r"pubsub", "GCP Pub/Sub"),
        ], facts.get("queue") or ("Async Queue" if is_ai and facts.get("hasQueue") else "Event stream and offline queue")),
        "monitoring": monitoring_nodes,
        "security": security_nodes,
        "integration": facts.get("integration") or ("Salesforce CRM" if facts.get("hasSalesforce") else "External Systems"),
        "tokenization": safe_text(facts.get("tokenization"), "PII token vault"),
        "conflict": safe_text(facts.get("conflict"), "Conflict and reroute engine"),
    }


def node_factory(kind):
    return {
        "users": Users,
        "client": Client,
        "service": Server,
        "router": Router,
        "firewall": Firewall,
        "database": PostgreSQL,
        "storage": Storage,
        "cache": Redis,
        "queue": RabbitMQ,
        "monitoring": Grafana,
        "security": Vault,
        "external": Rack,
        "ai": Rack,
    }.get(kind, Rack)


def create_node(kind, label):
    cls = detect_node_class(kind, label)
    return cls(safe_text(label, "Service"))


def detect_node_class(kind, label):
    text = safe_text(label, "Service").lower()

    if re.search(r"\bamplify\b", text):
        return Amplify
    if re.search(r"\bcloudfront\b", text):
        return CloudFront
    if re.search(r"\bapi gateway\b", text):
        return APIGateway
    if re.search(r'\bs3\b|simple storage service', text) or "blob storage" in text or "object storage" in text:
        return S3 if ("s3" in text or "simple storage service" in text) else Storage
    if re.search(r"\bdynamodb\b", text):
        return Dynamodb
    if re.search(r"\bdocumentdb\b", text):
        return DocumentdbMongodbCompatibility
    if re.search(r'\baurora\b', text):
        return Aurora
    if re.search(r"\bpgvector\b", text):
        return PostgreSQL
    if re.search(r'\bpostgres(?:ql)?\b', text):
        return RDSPostgresqlInstance if re.search(r'\brds\b|\bamazon\b', text) else PostgreSQL
    if re.search(r"\bopensearch\b|\belasticsearch\b", text):
        return ElasticsearchService
    if re.search(r'\bcloudwatch logs\b', text):
        return CloudwatchLogs
    if re.search(r'\bcloudwatch\b', text):
        return Cloudwatch
    if re.search(r'\brds\b', text):
        return RDS
    if re.search(r'\bredis\b|\belasticache\b', text):
        return ElasticacheForRedis if re.search(r'\belasticache\b|\bamazon\b', text) else Redis
    if re.search(r'\bbedrock\b', text):
        return Bedrock
    if re.search(r'\bsqs\b', text):
        return SQS
    if re.search(r'\beventbridge\b', text):
        return Eventbridge
    if re.search(r"\bstep functions\b", text):
        return StepFunctions
    if re.search(r'\bqueue\b', text):
        return RabbitMQ
    if re.search(r'\bwaf\b', text):
        return WAF
    if re.search(r'\bcognito\b', text):
        return Cognito
    if "secrets manager" in text:
        return SecretsManager
    if re.search(r'\bkms\b', text) or "key management service" in text:
        return KMS
    if re.search(r"\biam\b", text):
        return IAM
    if "app runner" in text:
        return AppRunner
    if re.search(r'\bfargate\b', text):
        return Fargate
    if re.search(r'\becs\b', text):
        return ECS
    if re.search(r'\blambda\b', text):
        return Lambda

    return node_factory(kind)


CLASS_IMPORTS = {
    Amplify: "from diagrams.aws.mobile import Amplify",
    CloudFront: "from diagrams.aws.network import CloudFront",
    APIGateway: "from diagrams.aws.network import APIGateway",
    S3: "from diagrams.aws.storage import S3",
    Storage: "from diagrams.generic.storage import Storage",
    Dynamodb: "from diagrams.aws.database import Dynamodb",
    DocumentdbMongodbCompatibility: "from diagrams.aws.database import DocumentdbMongodbCompatibility",
    Aurora: "from diagrams.aws.database import Aurora",
    PostgreSQL: "from diagrams.onprem.database import PostgreSQL",
    RDSPostgresqlInstance: "from diagrams.aws.database import RDSPostgresqlInstance",
    ElasticsearchService: "from diagrams.aws.analytics import ElasticsearchService",
    CloudwatchLogs: "from diagrams.aws.management import CloudwatchLogs",
    Cloudwatch: "from diagrams.aws.management import Cloudwatch",
    RDS: "from diagrams.aws.database import RDS",
    ElasticacheForRedis: "from diagrams.aws.database import ElasticacheForRedis",
    Redis: "from diagrams.onprem.inmemory import Redis",
    Bedrock: "from diagrams.aws.ml import Bedrock",
    SQS: "from diagrams.aws.integration import SQS",
    Eventbridge: "from diagrams.aws.integration import Eventbridge",
    StepFunctions: "from diagrams.aws.integration import StepFunctions",
    RabbitMQ: "from diagrams.onprem.queue import RabbitMQ",
    WAF: "from diagrams.aws.security import WAF",
    Cognito: "from diagrams.aws.security import Cognito",
    SecretsManager: "from diagrams.aws.security import SecretsManager",
    KMS: "from diagrams.aws.security import KMS",
    IAM: "from diagrams.aws.security import IAM",
    AppRunner: "from diagrams.aws.compute import AppRunner",
    Fargate: "from diagrams.aws.compute import Fargate",
    ECS: "from diagrams.aws.compute import ECS",
    Lambda: "from diagrams.aws.compute import Lambda",
    Users: "from diagrams.onprem.client import Users",
    Client: "from diagrams.onprem.client import Client",
    Server: "from diagrams.onprem.compute import Server",
    Router: "from diagrams.generic.network import Router",
    Firewall: "from diagrams.generic.network import Firewall",
    Grafana: "from diagrams.onprem.monitoring import Grafana",
    Vault: "from diagrams.onprem.security import Vault",
    Rack: "from diagrams.generic.compute import Rack",
}


ICON_KIND = {
    "internet": "users",
    "server": "service",
    "cloud": "external",
    "database": "database",
    "disk": "storage",
    "queue": "queue",
}


def py_string(value):
    return json.dumps(safe_text(value, "Service"), ensure_ascii=False)


def py_var(value, fallback="node"):
    text = re.sub(r"[^A-Za-z0-9_]+", "_", str(value or "")).strip("_").lower()
    if not text:
        text = fallback
    if re.match(r"^\d", text):
        text = f"n_{text}"
    return text


def graph_node_kind(label, group="", icon=""):
    text = f"{label} {group} {icon}".lower()
    if re.search(r"user|customer|associate|operator|shopper|physical stores|stores and", text):
        return "users"
    if re.search(r"\bmobile\b|\bpos\b|\bfrontend\b|\bweb\b|\bapp\b|\bchannel\b|\bcheckout\b", text):
        return "client"
    if re.search(r"waf|firewall|vlan|network|router|gateway|cdn|cloudfront", text):
        return "router"
    if re.search(r"aurora|postgres|database|db|ledger|projection|dynamodb|sql", text):
        return "database"
    if re.search(r"redis|cache|availability", text):
        return "cache"
    if re.search(r"queue|stream|kafka|msk|nats|jetstream|event|cdc|bus", text):
        return "queue"
    if re.search(r"s3|storage|audit|archive|object", text):
        return "storage"
    if re.search(r"security|pki|kms|secret|token|vault|cert|identity|auth|oidc|pci", text):
        return "security"
    if re.search(r"monitor|observability|telemetry|dashboard|runbook|cloudwatch", text):
        return "monitoring"
    if re.search(r"llm|model|bedrock|openai|claude|gemini|ai ", text):
        return "ai"
    if re.search(r"erp|cms|psp|payment provider|external|salesforce|commerce", text):
        return "external"
    return ICON_KIND.get(str(icon or "").lower(), "service")


def parse_diagram_code(code):
    lines = [line.strip() for line in str(code or "").splitlines() if line.strip()]
    graph = {"groups": [], "nodes": {}, "edges": []}
    current_group = ""
    group_seen = set()

    def add_group(group_id, label):
        if not group_id or group_id in group_seen:
            return
        group_seen.add(group_id)
        graph["groups"].append({"id": group_id, "label": safe_text(label, group_id)})

    def add_node(node_id, label=None, group=None, kind=None, icon=""):
        if not node_id:
            return
        existing = graph["nodes"].get(node_id, {})
        node_group = group or existing.get("group") or current_group
        node_label = label or existing.get("label") or node_id
        node_kind = kind or existing.get("kind") or graph_node_kind(node_label, node_group, icon)
        graph["nodes"][node_id] = {
            "id": node_id,
            "label": safe_text(node_label, node_id),
            "group": node_group or "",
            "kind": node_kind,
        }

    def add_edge(left, right):
        if left and right and left != right:
            graph["edges"].append((left, right))

    if not lines:
        return graph

    if lines[0].startswith("architecture-beta"):
        for line in lines[1:]:
            match = re.match(r"^group\s+([A-Za-z0-9_]+)\([^)]+\)\[([^\]]+)\]", line)
            if match:
                add_group(match.group(1), match.group(2))
                continue
            match = re.match(r"^service\s+([A-Za-z0-9_]+)\(([^)]+)\)\[([^\]]+)\](?:\s+in\s+([A-Za-z0-9_]+))?", line)
            if match:
                add_node(match.group(1), match.group(3), match.group(4) or "", icon=match.group(2))
                continue
            if "--" in line:
                clean = re.sub(r"\{group\}", "", line)
                ids = re.findall(r"(?:^|\s)([A-Za-z0-9_]+):[TBLR]|[TBLR]:([A-Za-z0-9_]+)(?:\s|$)", clean)
                ids = [left or right for left, right in ids]
                if len(ids) >= 2:
                    add_edge(ids[0], ids[1])
        return graph

    for line in lines:
        match = re.match(r"^subgraph\s+([A-Za-z0-9_]+)(?:\[\"([^\"]+)\"\])?", line)
        if match:
            current_group = match.group(1)
            add_group(current_group, match.group(2) or current_group)
            continue
        if line == "end":
            current_group = ""
            continue

        for node_id, label in re.findall(r"([A-Za-z_][A-Za-z0-9_]*)\[\"([^\"]+)\"\]", line):
            add_node(node_id, label, current_group)

        if "--" in line:
            compact = re.sub(r"([A-Za-z_][A-Za-z0-9_]*)\[\"[^\"]+\"\]", r"\1", line)
            parts = [part.strip() for part in re.split(r"\s*[-.=]+>\s*", compact)]
            ids = []
            for part in parts:
                match = re.search(r"([A-Za-z_][A-Za-z0-9_]*)", part)
                if match and match.group(1) not in {"subgraph", "end"}:
                    ids.append(match.group(1))
                    add_node(match.group(1), group=current_group)
            for left, right in zip(ids, ids[1:]):
                add_edge(left, right)

    return graph


def graph_has_content(graph):
    return bool(graph and graph.get("nodes"))


def class_for_node(node):
    return detect_node_class(node.get("kind", "service"), node.get("label", "Service"))


def generate_dynamic_source(payload, graph):
    title = safe_text(payload.get("title"), "architectiq-diagram")
    panel = payload.get("panel", "solution")
    direction = "TB" if panel == "deployment" else "LR"
    node_classes = {class_for_node(node) for node in graph["nodes"].values()}
    imports = ["from diagrams import Cluster, Diagram, Edge"]
    imports.extend(sorted(f"from {cls.__module__} import {cls.__name__}" for cls in node_classes))
    imports = list(dict.fromkeys(imports))
    lines = imports + ["", f"with Diagram({py_string(title)}, show=False, direction={py_string(direction)}, outformat=\"svg\"):"]

    grouped = {}
    for node in graph["nodes"].values():
        grouped.setdefault(node.get("group") or "", []).append(node)
    group_labels = {group["id"]: group["label"] for group in graph.get("groups", [])}
    emitted = set()
    for group in graph.get("groups", []):
        members = grouped.get(group["id"], [])
        if not members:
            continue
        lines.append(f"    with Cluster({py_string(group['label'])}):")
        for node in members:
            cls = class_for_node(node)
            var = py_var(node["id"])
            lines.append(f"        {var} = {cls.__name__}({py_string(node['label'])})")
            emitted.add(node["id"])
    for node in grouped.get("", []):
        cls = class_for_node(node)
        var = py_var(node["id"])
        lines.append(f"    {var} = {cls.__name__}({py_string(node['label'])})")
        emitted.add(node["id"])
    for node in graph["nodes"].values():
        if node["id"] in emitted:
            continue
        cls = class_for_node(node)
        var = py_var(node["id"])
        group_label = group_labels.get(node.get("group", ""), node.get("group", "Ungrouped"))
        lines.append(f"    with Cluster({py_string(group_label)}):")
        lines.append(f"        {var} = {cls.__name__}({py_string(node['label'])})")
    for left, right in graph.get("edges", []):
        if left in graph["nodes"] and right in graph["nodes"]:
            lines.append(f"    {py_var(left)} >> Edge() >> {py_var(right)}")
    return "\n".join(lines)


def render_dynamic_panel(payload, graph):
    title = safe_text(payload.get("title"), "architectiq-diagram")
    panel = payload.get("panel", "solution")
    direction = "TB" if panel == "deployment" else "LR"
    source = generate_dynamic_source(payload, graph)
    graph_attr = {
        "pad": "0.2",
        "nodesep": "0.38",
        "ranksep": "0.56",
        "splines": "ortho",
        "fontname": "Inter",
        "fontsize": "13",
        "bgcolor": "transparent",
        "overlap": "false",
        "concentrate": "true",
        "newrank": "true",
        "margin": "0",
        "outputorder": "edgesfirst",
    }
    node_attr = {
        "fontname": "Inter",
        "fontsize": "11",
        "imagescale": "true",
        "width": "1.08",
        "height": "1.15",
    }
    edge_attr = {"color": "#5B708B", "penwidth": "1.4"}
    grouped = {}
    for node in graph["nodes"].values():
        grouped.setdefault(node.get("group") or "", []).append(node)

    with tempfile.TemporaryDirectory(dir=LOG_DIR) as temp_dir:
        filename = os.path.join(temp_dir, "diagram")
        with Diagram(title, filename=filename, outformat="svg", show=False, direction=direction, graph_attr=graph_attr, node_attr=node_attr, edge_attr=edge_attr):
            rendered_nodes = {}
            for group in graph.get("groups", []):
                members = grouped.get(group["id"], [])
                if not members:
                    continue
                with Cluster(group["label"]):
                    for node in members:
                        rendered_nodes[node["id"]] = class_for_node(node)(safe_text(node["label"], "Service"))
            for node in grouped.get("", []):
                rendered_nodes[node["id"]] = class_for_node(node)(safe_text(node["label"], "Service"))
            for node in graph["nodes"].values():
                if node["id"] not in rendered_nodes:
                    rendered_nodes[node["id"]] = class_for_node(node)(safe_text(node["label"], "Service"))
            for left, right in graph.get("edges", []):
                if left in rendered_nodes and right in rendered_nodes:
                    rendered_nodes[left] >> Edge() >> rendered_nodes[right]

        svg = Path(f"{filename}.svg").read_text(encoding="utf-8")
        svg = inline_svg_images(svg)
        return {"ok": True, "panel": panel, "title": title, "svg": svg, "source": source}


def inline_svg_images(svg_text):
    def replace(match):
        href = match.group(1)
        if href.startswith("data:"):
            return match.group(0)

        image_path = Path(href)
        if not image_path.exists():
            return match.group(0)

        suffix = image_path.suffix.lower()
        mime = "image/png" if suffix == ".png" else "image/svg+xml" if suffix == ".svg" else "application/octet-stream"
        encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
        return f'xlink:href="data:{mime};base64,{encoded}"'

    return IMAGE_HREF_PATTERN.sub(replace, svg_text)


def generate_source(payload):
    graph = parse_diagram_code(payload.get("code", ""))
    if graph_has_content(graph):
        return generate_dynamic_source(payload, graph)

    facts = payload.get("facts", {})
    visual = build_visual_facts(facts)
    panel = payload.get("panel", "solution")
    title = safe_text(payload.get("title"), "architectiq-diagram")
    direction = "TB" if panel == "deployment" else "LR"

    lines = [
        "from diagrams import Cluster, Diagram, Edge",
        "from diagrams_render import create_node",
        "",
        f'with Diagram("{title}", show=False, direction="{direction}", outformat="svg"):',
    ]

    if panel == "context":
        if visual["is_ai"]:
            lines.extend([
            '    users = create_node("users", "Customers and Operators")',
            f'    platform = create_node("external", "{visual["company"]}")',
            f'    ai = create_node("ai", "{visual["llm"]}")',
            f'    data = create_node("database", "{visual["data"]}")',
            f'    integrations = create_node("external", "{visual["integration"]}")',
            f'    ops = create_node("monitoring", "{visual["monitoring"][0]}")',
            "    users >> platform",
            "    platform >> ai",
            "    platform >> data",
            "    platform >> integrations",
            "    platform >> ops",
            ])
        else:
            lines.extend([
            '    stores = create_node("users", "Physical stores and associates")',
            '    ecommerce_users = create_node("users", "E-commerce customers")',
            f'    platform = create_node("external", "{visual["company"]}")',
            f'    inventory = create_node("database", "{visual["data"]}")',
            '    commerce = create_node("external", "E-commerce CMS")',
            '    erp = create_node("external", "ERP POS core")',
            '    psp = create_node("external", "Payment provider P2PE rails")',
            f'    ops = create_node("monitoring", "{visual["monitoring"][0]}")',
            "    stores >> platform",
            "    ecommerce_users >> platform",
            "    platform >> inventory",
            "    platform >> commerce",
            "    platform >> erp",
            "    stores >> psp",
            "    platform >> ops",
            ])
    elif panel == "deployment":
        if visual["is_ai"]:
            lines.extend([
            f'    with Cluster("{visual["region"]}"):',
            '        with Cluster("Edge"):',
            f'            ui = create_node("client", "{visual["ui"]}")',
            f'            edge = create_node("router", "{visual["edge"]}")',
            '        with Cluster("Runtime"):',
            f'            api = create_node("service", "{visual["api"]}")',
            f'            orchestrator = create_node("service", "{visual["orchestration"]}")',
            f'            queue = create_node("queue", "{visual["queue"]}")',
            '        with Cluster("AI"):',
            f'            llm = create_node("ai", "{visual["llm"]}")',
            f'            fallback = create_node("ai", "{visual["fallback"]}")',
            f'            trace = create_node("monitoring", "{visual["trace"]}")',
            '        with Cluster("Data"):',
            f'            db = create_node("database", "{visual["data"]}")',
            f'            vector = create_node("external", "{visual["vector"]}")',
            f'            store = create_node("storage", "{visual["store"]}")',
            f'            cache = create_node("cache", "{visual["cache"]}")',
            '    with Cluster("Ops and Security"):',
        ])
            for index, label in enumerate(visual["monitoring"]):
                lines.append(f'        mon{index} = create_node("monitoring", "{label}")')
            for index, label in enumerate(visual["security"]):
                lines.append(f'        sec{index} = create_node("security", "{label}")')
            lines.extend([
            "    ui >> edge >> api >> orchestrator",
            "    orchestrator >> llm",
            "    orchestrator >> fallback",
            "    orchestrator >> Edge(constraint=\"false\") >> trace",
            "    api >> db >> vector",
            "    api >> store",
            "    api >> cache",
            "    api >> Edge(constraint=\"false\") >> queue",
            ])
            for index, label in enumerate(visual["monitoring"]):
                origin = "orchestrator" if re.search(r"langsmith|helicone", label, re.IGNORECASE) else "api"
                lines.append(f'    {origin} >> Edge(constraint="false") >> mon{index}')
            for index, label in enumerate(visual["security"]):
                if re.search(r"cognito", label, re.IGNORECASE):
                    lines.append(f'    ui >> Edge(constraint="false") >> sec{index}')
                    lines.append(f'    sec{index} >> Edge(constraint="false") >> api')
                elif re.search(r"kms", label, re.IGNORECASE):
                    lines.append(f'    db >> Edge(constraint="false") >> sec{index}')
                    lines.append(f'    store >> Edge(constraint="false") >> sec{index}')
                else:
                    lines.append(f'    api >> Edge(constraint="false") >> sec{index}')
        else:
            lines.extend([
            '    with Cluster("Store Edge"):',
            '        pos = create_node("client", "POS lanes and mobile apps")',
            f'        edge = create_node("service", "{visual["orchestration"]}")',
            f'        local_queue = create_node("queue", "{visual["queue"]}")',
            '        offline_auth = create_node("security", "Offline auth and device trust")',
            f'    with Cluster("{visual["region"]}"):',
            f'        api = create_node("service", "{visual["api"]}")',
            f'        stream = create_node("queue", "{visual["queue"]}")',
            f'        conflict = create_node("service", "{visual["conflict"]}")',
            '    with Cluster("Inventory Data"):',
            f'        db = create_node("database", "{visual["data"]}")',
            f'        projection = create_node("cache", "{visual["vector"]}")',
            f'        token_vault = create_node("security", "{visual["tokenization"]}")',
            f'        audit = create_node("storage", "{visual["store"]}")',
            '    with Cluster("Commerce Integrations"):',
            '        commerce = create_node("external", "E-commerce CMS")',
            '        erp = create_node("external", "ERP POS core")',
            '        psp = create_node("external", "PSP P2PE rails")',
            '    with Cluster("Ops and Security"):',
            f'        mon = create_node("monitoring", "{visual["monitoring"][0]}")',
            f'        sec = create_node("security", "{visual["security"][0]}")',
            "    pos >> edge >> local_queue >> stream >> api",
            "    offline_auth >> Edge(constraint=\"false\") >> edge",
            "    pos >> Edge(constraint=\"false\") >> psp",
            "    api >> db >> projection",
            "    api >> conflict",
            "    conflict >> commerce",
            "    conflict >> erp",
            "    pos >> Edge(constraint=\"false\") >> token_vault",
            "    db >> audit",
            "    api >> Edge(constraint=\"false\") >> mon",
            "    token_vault >> Edge(constraint=\"false\") >> sec",
            ])
    elif panel == "request":
        if visual["is_ai"]:
            lines.extend([
            '    customer = create_node("users", "Customer")',
            f'    channel = create_node("client", "{visual["ui"]}")',
            f'    api = create_node("service", "{visual["api"]}")',
            f'    orchestrator = create_node("service", "{visual["orchestration"]}")',
            '    retrieval = create_node("external", "Context Retrieval")',
            f'    db = create_node("database", "{visual["data"]}")',
            f'    vector = create_node("external", "{visual["vector"]}")',
            f'    llm = create_node("ai", "{visual["llm"]}")',
            '    response = create_node("client", "Response Path")',
            f'    handoff = create_node("queue", "{visual["queue"]}")',
            f'    integration = create_node("external", "{visual["integration"]}")',
            "    customer >> channel >> api >> orchestrator",
            "    db >> retrieval",
            "    vector >> retrieval",
            "    retrieval >> orchestrator >> llm >> orchestrator >> response >> customer",
            "    api >> handoff >> integration",
            ])
        else:
            lines.extend([
            '    sale = create_node("users", "In-store checkout sale")',
            '    local_decision = create_node("service", "Local edge sale commit")',
            f'    pii = create_node("security", "{visual["tokenization"]}")',
            '    payment = create_node("external", "P2PE payment token")',
            f'    queue = create_node("queue", "{visual["queue"]}")',
            '    reconnect = create_node("router", "Connectivity stable for replay")',
            f'    stream = create_node("queue", "{visual["queue"]}")',
            f'    ledger = create_node("database", "{visual["data"]}")',
            f'    projection = create_node("cache", "{visual["vector"]}")',
            f'    conflict = create_node("service", "{visual["conflict"]}")',
            '    ecommerce = create_node("external", "E-commerce availability")',
            '    reroute = create_node("external", "Online order reroute")',
            '    audit = create_node("monitoring", "Replay audit dashboard")',
            "    sale >> local_decision",
            "    local_decision >> pii",
            "    local_decision >> payment",
            "    local_decision >> queue >> reconnect >> stream >> ledger >> projection >> ecommerce",
            "    ledger >> conflict >> reroute",
            "    queue >> Edge(constraint=\"false\") >> audit",
            ])
    else:
        if visual["is_ai"]:
            lines.extend([
            '    users = create_node("users", "Customers and Operators")',
            f'    ui = create_node("client", "{visual["ui"]}")',
            f'    edge = create_node("router", "{visual["edge"]}")',
            f'    api = create_node("service", "{visual["api"]}")',
            f'    orchestrator = create_node("service", "{visual["orchestration"]}")',
            f'    llm = create_node("ai", "{visual["llm"]}")',
            f'    fallback = create_node("ai", "{visual["fallback"]}")',
            f'    trace = create_node("monitoring", "{visual["trace"]}")',
            f'    db = create_node("database", "{visual["data"]}")',
            f'    vector = create_node("external", "{visual["vector"]}")',
            f'    store = create_node("storage", "{visual["store"]}")',
            f'    cache = create_node("cache", "{visual["cache"]}")',
            f'    queue = create_node("queue", "{visual["queue"]}")',
            f'    integration = create_node("external", "{visual["integration"]}")',
        ])
            for index, label in enumerate(visual["monitoring"]):
                lines.append(f'    mon{index} = create_node("monitoring", "{label}")')
            for index, label in enumerate(visual["security"]):
                lines.append(f'    sec{index} = create_node("security", "{label}")')
            lines.extend([
            "    users >> ui >> edge >> api >> orchestrator",
            "    orchestrator >> llm",
            "    orchestrator >> fallback",
            "    orchestrator >> Edge(constraint=\"false\") >> trace",
            "    api >> db >> vector",
            "    api >> store",
            "    api >> cache",
            "    api >> Edge(constraint=\"false\") >> queue >> integration",
            ])
            for index, label in enumerate(visual["monitoring"]):
                origin = "orchestrator" if re.search(r"langsmith|helicone", label, re.IGNORECASE) else "api"
                lines.append(f'    {origin} >> Edge(constraint="false") >> mon{index}')
            for index, label in enumerate(visual["security"]):
                if re.search(r"cognito", label, re.IGNORECASE):
                    lines.append(f'    ui >> Edge(constraint="false") >> sec{index}')
                    lines.append(f'    sec{index} >> Edge(constraint="false") >> api')
                elif re.search(r"kms", label, re.IGNORECASE):
                    lines.append(f'    db >> Edge(constraint="false") >> sec{index}')
                    lines.append(f'    store >> Edge(constraint="false") >> sec{index}')
                else:
                    lines.append(f'    api >> Edge(constraint="false") >> sec{index}')
        else:
            lines.extend([
            '    stores = create_node("users", "Stores and associates")',
            '    pos = create_node("client", "POS lanes and mobile apps")',
            f'    edge = create_node("service", "{visual["orchestration"]}")',
            f'    queue = create_node("queue", "{visual["queue"]}")',
            f'    api = create_node("service", "{visual["api"]}")',
            f'    db = create_node("database", "{visual["data"]}")',
            f'    projection = create_node("cache", "{visual["vector"]}")',
            f'    token_vault = create_node("security", "{visual["tokenization"]}")',
            f'    conflict = create_node("service", "{visual["conflict"]}")',
            f'    integration = create_node("external", "{visual["integration"]}")',
            f'    mon = create_node("monitoring", "{visual["monitoring"][0]}")',
            f'    sec = create_node("security", "{visual["security"][0]}")',
            "    stores >> pos >> edge >> queue >> api >> db >> projection",
            "    pos >> token_vault",
            "    api >> conflict >> integration",
            "    api >> Edge(constraint=\"false\") >> mon",
            "    token_vault >> Edge(constraint=\"false\") >> sec",
            ])

    return "\n".join(lines)


def build_labeled_nodes(kind, labels):
    return [(safe_text(label, "Service"), create_node(kind, label)) for label in labels if str(label or "").strip()]


def connect_monitoring(api, orchestrator, monitoring_nodes):
    for label, node in monitoring_nodes:
        source = orchestrator if re.search(r"langsmith|helicone", label, re.IGNORECASE) else api
        source >> Edge(constraint="false") >> node


def connect_security(ui, api, db, store, security_nodes):
    for label, node in security_nodes:
        if re.search(r"cognito", label, re.IGNORECASE):
            ui >> Edge(constraint="false") >> node
            node >> Edge(constraint="false") >> api
        elif re.search(r"kms", label, re.IGNORECASE):
            db >> Edge(constraint="false") >> node
            store >> Edge(constraint="false") >> node
        else:
            api >> Edge(constraint="false") >> node


def render_panel(payload):
    graph = parse_diagram_code(payload.get("code", ""))
    if graph_has_content(graph):
        return render_dynamic_panel(payload, graph)

    facts = payload.get("facts", {})
    visual = build_visual_facts(facts)
    panel = payload.get("panel", "solution")
    title = safe_text(payload.get("title"), "architectiq-diagram")
    direction = "TB" if panel == "deployment" else "LR"

    graph_attr = {
        "pad": "0.2",
        "nodesep": "0.38",
        "ranksep": "0.56",
        "splines": "ortho",
        "fontname": "Inter",
        "fontsize": "13",
        "bgcolor": "transparent",
        "overlap": "false",
        "concentrate": "true",
        "newrank": "true",
        "margin": "0",
        "outputorder": "edgesfirst",
    }
    node_attr = {
        "fontname": "Inter",
        "fontsize": "11",
        "imagescale": "true",
        "width": "1.08",
        "height": "1.15",
    }
    edge_attr = {
        "color": "#5B708B",
        "penwidth": "1.4",
    }

    source = generate_source(payload)

    with tempfile.TemporaryDirectory(dir=LOG_DIR) as temp_dir:
        filename = os.path.join(temp_dir, "diagram")
        with Diagram(
            title,
            filename=filename,
            outformat="svg",
            show=False,
            direction=direction,
            graph_attr=graph_attr,
            node_attr=node_attr,
            edge_attr=edge_attr,
        ):
            if panel == "context":
                if visual["is_ai"]:
                    users = create_node("users", "Customers and Operators")
                    platform = create_node("external", visual["company"])
                    ai = create_node("ai", visual["llm"])
                    data = create_node("database", visual["data"])
                    integrations = create_node("external", visual["integration"])
                    ops = create_node("monitoring", visual["monitoring"][0])

                    users >> platform
                    platform >> ai
                    platform >> data
                    platform >> integrations
                    platform >> ops
                else:
                    stores = create_node("users", "Physical stores and associates")
                    ecommerce_users = create_node("users", "E-commerce customers")
                    platform = create_node("external", visual["company"])
                    inventory = create_node("database", visual["data"])
                    commerce = create_node("external", "E-commerce CMS")
                    erp = create_node("external", "ERP POS core")
                    psp = create_node("external", "Payment provider P2PE rails")
                    ops = create_node("monitoring", visual["monitoring"][0])

                    stores >> platform
                    ecommerce_users >> platform
                    platform >> inventory
                    platform >> commerce
                    platform >> erp
                    stores >> psp
                    platform >> ops

            elif panel == "deployment":
                if visual["is_ai"]:
                    with Cluster(visual["region"]):
                        with Cluster("Edge"):
                            ui = create_node("client", visual["ui"])
                            edge = create_node("router", visual["edge"])
                        with Cluster("Runtime"):
                            api = create_node("service", visual["api"])
                            orchestrator = create_node("service", visual["orchestration"])
                            queue = create_node("queue", visual["queue"])
                        with Cluster("AI"):
                            llm = create_node("ai", visual["llm"])
                            fallback = create_node("ai", visual["fallback"])
                            trace = create_node("monitoring", visual["trace"])
                        with Cluster("Data"):
                            db = create_node("database", visual["data"])
                            vector = create_node("external", visual["vector"])
                            store = create_node("storage", visual["store"])
                            cache = create_node("cache", visual["cache"])
                    with Cluster("Ops and Security"):
                        mon_nodes = build_labeled_nodes("monitoring", visual["monitoring"])
                        sec_nodes = build_labeled_nodes("security", visual["security"])

                    ui >> edge >> api >> orchestrator
                    orchestrator >> llm
                    orchestrator >> fallback
                    orchestrator >> Edge(constraint="false") >> trace
                    api >> db >> vector
                    api >> store
                    api >> cache
                    api >> Edge(constraint="false") >> queue
                    connect_monitoring(api, orchestrator, mon_nodes)
                    connect_security(ui, api, db, store, sec_nodes)
                else:
                    with Cluster("Store Edge"):
                        pos = create_node("client", "POS lanes and mobile apps")
                        edge = create_node("service", visual["orchestration"])
                        local_queue = create_node("queue", visual["queue"])
                        offline_auth = create_node("security", "Offline auth and device trust")
                    with Cluster(visual["region"]):
                        api = create_node("service", visual["api"])
                        stream = create_node("queue", visual["queue"])
                        conflict = create_node("service", visual["conflict"])
                    with Cluster("Inventory Data"):
                        db = create_node("database", visual["data"])
                        projection = create_node("cache", visual["vector"])
                        token_vault = create_node("security", visual["tokenization"])
                        audit = create_node("storage", visual["store"])
                    with Cluster("Commerce Integrations"):
                        commerce = create_node("external", "E-commerce CMS")
                        erp = create_node("external", "ERP POS core")
                        psp = create_node("external", "PSP P2PE rails")
                    with Cluster("Ops and Security"):
                        mon = create_node("monitoring", visual["monitoring"][0])
                        sec = create_node("security", visual["security"][0])

                    pos >> edge >> local_queue >> stream >> api
                    offline_auth >> Edge(constraint="false") >> edge
                    pos >> Edge(constraint="false") >> psp
                    api >> db >> projection
                    api >> conflict
                    conflict >> commerce
                    conflict >> erp
                    pos >> Edge(constraint="false") >> token_vault
                    db >> audit
                    api >> Edge(constraint="false") >> mon
                    token_vault >> Edge(constraint="false") >> sec

            elif panel == "request":
                if visual["is_ai"]:
                    customer = create_node("users", "Customer")
                    channel = create_node("client", visual["ui"])
                    api = create_node("service", visual["api"])
                    orchestrator = create_node("service", visual["orchestration"])
                    retrieval = create_node("external", "Context Retrieval")
                    db = create_node("database", visual["data"])
                    vector = create_node("external", visual["vector"])
                    llm = create_node("ai", visual["llm"])
                    response = create_node("client", "Response Path")
                    handoff = create_node("queue", visual["queue"])
                    integration = create_node("external", visual["integration"])

                    customer >> channel >> api >> orchestrator
                    db >> retrieval
                    vector >> retrieval
                    retrieval >> orchestrator >> llm >> orchestrator >> response >> customer
                    api >> Edge(constraint="false") >> handoff >> integration
                else:
                    sale = create_node("users", "In-store checkout sale")
                    local_decision = create_node("service", "Local edge sale commit")
                    pii = create_node("security", visual["tokenization"])
                    payment = create_node("external", "P2PE payment token")
                    queue = create_node("queue", visual["queue"])
                    reconnect = create_node("router", "Connectivity stable for replay")
                    stream = create_node("queue", visual["queue"])
                    ledger = create_node("database", visual["data"])
                    projection = create_node("cache", visual["vector"])
                    conflict = create_node("service", visual["conflict"])
                    ecommerce = create_node("external", "E-commerce availability")
                    reroute = create_node("external", "Online order reroute")
                    audit = create_node("monitoring", "Replay audit dashboard")

                    sale >> local_decision
                    local_decision >> pii
                    local_decision >> payment
                    local_decision >> queue >> reconnect >> stream >> ledger >> projection >> ecommerce
                    ledger >> conflict >> reroute
                    queue >> Edge(constraint="false") >> audit

            else:
                if visual["is_ai"]:
                    users = create_node("users", "Customers and Operators")
                    ui = create_node("client", visual["ui"])
                    edge = create_node("router", visual["edge"])
                    api = create_node("service", visual["api"])
                    orchestrator = create_node("service", visual["orchestration"])
                    llm = create_node("ai", visual["llm"])
                    fallback = create_node("ai", visual["fallback"])
                    trace = create_node("monitoring", visual["trace"])
                    db = create_node("database", visual["data"])
                    vector = create_node("external", visual["vector"])
                    store = create_node("storage", visual["store"])
                    cache = create_node("cache", visual["cache"])
                    queue = create_node("queue", visual["queue"])
                    integration = create_node("external", visual["integration"])
                    mon_nodes = build_labeled_nodes("monitoring", visual["monitoring"])
                    sec_nodes = build_labeled_nodes("security", visual["security"])

                    users >> ui >> edge >> api >> orchestrator
                    orchestrator >> llm
                    orchestrator >> fallback
                    orchestrator >> Edge(constraint="false") >> trace
                    api >> db >> vector
                    api >> store
                    api >> cache
                    api >> Edge(constraint="false") >> queue >> integration
                    connect_monitoring(api, orchestrator, mon_nodes)
                    connect_security(ui, api, db, store, sec_nodes)
                else:
                    stores = create_node("users", "Stores and associates")
                    pos = create_node("client", "POS lanes and mobile apps")
                    edge = create_node("service", visual["orchestration"])
                    queue = create_node("queue", visual["queue"])
                    api = create_node("service", visual["api"])
                    db = create_node("database", visual["data"])
                    projection = create_node("cache", visual["vector"])
                    token_vault = create_node("security", visual["tokenization"])
                    conflict = create_node("service", visual["conflict"])
                    integration = create_node("external", visual["integration"])
                    mon = create_node("monitoring", visual["monitoring"][0])
                    sec = create_node("security", visual["security"][0])

                    stores >> pos >> edge >> queue >> api >> db >> projection
                    pos >> token_vault
                    api >> conflict >> integration
                    api >> Edge(constraint="false") >> mon
                    token_vault >> Edge(constraint="false") >> sec

        svg = Path(f"{filename}.svg").read_text(encoding="utf-8")
        svg = inline_svg_images(svg)
        return {
            "ok": True,
            "panel": panel,
            "title": title,
            "svg": svg,
            "source": source,
        }


def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        result = render_panel(payload)
        sys.stdout.write(json.dumps(result, ensure_ascii=False))
    except Exception as exc:
        sys.stdout.write(json.dumps({
            "ok": False,
            "error": {"message": str(exc)}
        }, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
