# Start from the Ubuntu 22.04 base image
FROM ubuntu:22.04

ARG PERSISTENT_STATE
ENV PERSISTENT_STATE=$PERSISTENT_STATE

ARG RESET_KATANA
ENV RESET_KATANA=$RESET_KATANA


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
    && rm -rf /var/lib/apt/lists/* && \
	curl -L https://install.dojoengine.org | bash && \
	/root/.dojo/bin/dojoup --version 0.3.10

EXPOSE 5050

EXPOSE 8080

WORKDIR /app

COPY . /app

RUN chmod +x ./scripts/*
