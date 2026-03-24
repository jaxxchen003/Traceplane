FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run db:generate
RUN npm run build
RUN mkdir -p .next/standalone/.next \
  && cp -R .next/static .next/standalone/.next/static \
  && if [ -d public ]; then cp -R public .next/standalone/public; fi

EXPOSE 3000
CMD ["npm", "run", "start:demo"]
