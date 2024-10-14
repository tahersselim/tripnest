# Use Node.js version 18 for the build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package.json and package-lock.json first for better build caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Use Node.js again for the production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only the built application from the builder stage
COPY --from=builder /app ./

# Expose the port Next.js will run on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
