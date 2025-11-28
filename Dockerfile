# Use a multi-stage build to compile the Rust project.
# Start with a Rust image to build the project.
FROM rust:latest as builder
WORKDIR /usr/src/priorities
# Copy your source and manifest files to the image
COPY . .
# Use example config if no Configuration.toml exists (for CI)
RUN if [ ! -f Configuration.toml ]; then cp Configuration.toml.example Configuration.toml; fi
# Build your application
RUN cargo build --release

# The final stage begins here.
FROM debian:bookworm-slim
WORKDIR /root
# Install OpenSSL
RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*
# Copy the compiled binary from the builder stage.
COPY --from=builder /usr/src/priorities/target/release/priorities /root/priorities
# Copy static assets and configuration
COPY --from=builder /usr/src/priorities/static /root/static
COPY --from=builder /usr/src/priorities/Configuration.toml /root/Configuration.toml
# Expose port
EXPOSE 8080
# Command to run
CMD ["/root/priorities"]
