# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy files
COPY . .

RUN apk add --update ffmpeg
# Install dependencies
RUN npm install

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Run app
CMD ["node", "dist/main"]
