import base64
import re
from pathlib import Path

from diagrams import Cluster, Diagram
from diagrams.aws.compute import AppRunner
from diagrams.aws.database import Aurora
from diagrams.aws.integration import SQS
from diagrams.aws.network import CloudFront
from diagrams.aws.security import WAF
from diagrams.onprem.client import Users
from diagrams.programming.language import Python
from diagrams.saas.chat import Slack

IMAGE_HREF_PATTERN = re.compile(r'xlink:href="([^"]+)"')


def inline_svg_images(svg_text):
    def replace(match):
        href = match.group(1)
        if href.startswith("data:"):
            return match.group(0)

        image_path = Path(href)
        if not image_path.exists():
            return match.group(0)

        encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
        return f'xlink:href="data:image/png;base64,{encoded}"'

    return IMAGE_HREF_PATTERN.sub(replace, svg_text)


with Diagram(
    "architectiq-diagrams-poc",
    filename="logs/architectiq-diagrams-poc",
    outformat="svg",
    show=False,
    direction="LR",
):
    users = Users("Consultant")

    with Cluster("Edge"):
        edge = CloudFront("Web app")
        waf = WAF("WAF")

    with Cluster("Application"):
        api = AppRunner("API")
        worker = Python("Worker")
        queue = SQS("Async jobs")

    with Cluster("Data and AI"):
        db = Aurora("PostgreSQL")
        llm = Slack("LLM provider")

    users >> edge >> waf >> api
    api >> db
    api >> llm
    api >> queue >> worker
    worker >> db


svg_path = Path("logs/architectiq-diagrams-poc.svg")
svg_path.write_text(inline_svg_images(svg_path.read_text(encoding="utf-8")), encoding="utf-8")
