# The ML prediction service (FastAPI + scikit-learn). Optional — the API has
# analytical fallbacks and runs fine without it — but recommended for real use.
FROM python:3.12-slim AS runtime
WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY feature_utils.py train.py main.py ./

# Bake the (synthetic-data) models into the image so the container is
# ready to serve immediately. In real use these pkls would be replaced by
# models retrained on actual procurement history.
RUN python train.py

ENV ML_PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${ML_PORT}"]
