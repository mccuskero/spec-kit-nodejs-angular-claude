FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for both dev and prod
RUN apk add --no-cache bash dos2unix

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy entrypoint script first
COPY entrypoint.sh ./

# Fix line endings and make executable
RUN dos2unix entrypoint.sh && \
    chmod +x entrypoint.sh

# Copy rest of source code and configuration
COPY . .

# Expose port 80
EXPOSE 80

# Set default NODE_ENV to development if not specified
ENV NODE_ENV=development

# Use entrypoint script to decide between dev/prod mode
ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]
