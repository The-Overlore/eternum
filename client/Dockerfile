# Start from the Ubuntu 22.04 base image
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-c"]

# Update and install some common packages
RUN apt-get update && apt-get install -y \
    curl \
    git \
    vim \
    wget \
	jq \
	bc \
	unzip \
    && rm -rf /var/lib/apt/lists/* && \
	curl -fsSL https://bun.sh/install | bash

EXPOSE 5050 8080

COPY ./tmp/package.json /

COPY ./client.sh /

SHELL ["/bin/bash", "-c"]

WORKDIR /app