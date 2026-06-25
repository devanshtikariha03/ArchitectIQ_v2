FROM node:20-slim

# Install Python 3, pip, and Graphviz (required by the diagrams Python library)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    graphviz \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install the Python diagrams library globally
RUN pip3 install --no-cache-dir diagrams --break-system-packages

WORKDIR /app

# Install Node dependencies first (cached layer unless package.json changes)
COPY package.json ./
RUN npm install --omit=dev

# Copy application files
COPY server.js ./
COPY ArchitectIQ.html ./
COPY diagrams_render.py ./
COPY diagrams_poc.py ./

# Create logs directory (server expects it to exist)
RUN mkdir -p logs

EXPOSE 10000

ENV NODE_ENV=production
# Tell server.js to use the system python3 for diagram rendering
ENV PYTHON_BIN=python3

CMD ["node", "server.js"]
