FROM python:3.12-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_ENV=production
EXPOSE 8000
CMD ["python", "api_server.py"]
RUN pip install --no-cache-dir flask-cors
