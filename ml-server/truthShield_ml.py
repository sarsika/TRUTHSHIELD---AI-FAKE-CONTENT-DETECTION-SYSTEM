from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Training data
# ---------------------------------------------------------------------------
# NOTE: Previously this was 12 hardcoded example sentences with no accuracy
# measurement anywhere in the code — meaning any "~95% accuracy" claim was
# not something this code actually verified. This version has a larger
# (still small, hand-written) labeled dataset AND computes real accuracy /
# precision / recall / F1 on a held-out test split at startup, so any number
# quoted about this model is something you can point to in the code.
#
# For a genuinely production-grade model, replace `train_texts`/`train_labels`
# below with a real labeled dataset (e.g. a Kaggle fake-news/phishing corpus
# with thousands of rows) — the Flask/sklearn pipeline itself does not need
# to change.
# ---------------------------------------------------------------------------

train_texts = [
    # FAKE / SCAM / PHISHING (label 1)
    "free iphone lottery winner claim now",
    "congratulations you won a prize claim immediately",
    "urgent your bank account suspended verify now",
    "click here free gift card limited time offer",
    "you have been selected for cash reward act now",
    "win free money guaranteed risk free offer",
    "your otp has expired resend immediately to verify account",
    "share this message to 10 friends to unlock reward",
    "government hiding this secret cure from public",
    "act now before this link is taken down forever",
    "you have won a lottery of 10 lakh rupees claim your prize",
    "verify your kyc immediately or your account will be blocked",
    "limited time offer click link to claim your free reward",
    "breaking urgent alert your card has been compromised",
    "forward this to everyone before government deletes it",
    "congratulations selected for cash prize send bank details",
    "your parcel is stuck pay small fee to release it now",
    "double your money in 24 hours guaranteed investment",
    "this app gives free recharge just enter your card number",
    "urgent security alert unusual login detected click here",
    # GENUINE / LEGITIMATE (label 0)
    "PM announces new education policy for students",
    "weather forecast for tomorrow sunny skies",
    "new movie releases this weekend in theatres",
    "stock market update quarterly results announced",
    "local sports team wins championship match",
    "government budget session starts next week",
    "government of india press information bureau official statement",
    "ministry of health issues guidelines for hospitals",
    "supreme court verified confirmed judgement on the case",
    "quarterly earnings report announced by the company",
    "official press release from the state government",
    "new railway timetable confirmed by ministry of railways",
    "university announces exam schedule for this semester",
    "city council approves new public park construction",
    "national weather service issues rain advisory for the region",
    "central bank announces revised interest rate policy",
    "school reopens after summer break next monday",
    "election commission announces polling dates",
    "hospital confirms new vaccination drive starting next week",
    "official government press briefing scheduled for tomorrow",
]

train_labels = (
    [1] * 20 +  # fake/scam/phishing examples above
    [0] * 20    # genuine/legitimate examples above
)
# 1 = FAKE/SCAM, 0 = LEGITIMATE

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(train_texts)

# Held-out test split so we can report a real, honest accuracy number
# instead of an unverified claim.
X_train, X_test, y_train, y_test = train_test_split(
    X, train_labels, test_size=0.25, random_state=42, stratify=train_labels
)

model = LogisticRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
metrics = {
    "accuracy": round(accuracy_score(y_test, y_pred) * 100, 1),
    "precision": round(precision_score(y_test, y_pred, zero_division=0) * 100, 1),
    "recall": round(recall_score(y_test, y_pred, zero_division=0) * 100, 1),
    "f1": round(f1_score(y_test, y_pred, zero_division=0) * 100, 1),
}
print(f"[TruthShield ML] Held-out test metrics: {metrics}")
print("[TruthShield ML] NOTE: this dataset is small (40 hand-written rows) — "
      "these numbers demonstrate the evaluation pipeline works, not "
      "production-grade accuracy. Retrain on a real labeled dataset "
      "before quoting an accuracy figure anywhere external (resume, demo).")

# Refit on ALL data for serving (common practice once you've validated on
# the held-out split above) — the vectorizer/model used by /detect.
model.fit(X, train_labels)


@app.route('/detect', methods=['POST'])
def detect():
    data = request.json or {}
    text = data.get('text', '')

    if not text or not text.strip():
        return jsonify({"error": "No text provided"}), 400

    X_test_input = vectorizer.transform([text])
    prediction = model.predict(X_test_input)[0]
    confidence = model.predict_proba(X_test_input)[0].max()

    result = {
        'isFake': bool(prediction == 1),
        'category': 'SCAM' if prediction == 1 else 'LEGITIMATE',
        'confidence': round(float(confidence) * 100, 1)
    }

    return jsonify(result)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'TruthShield ML Running!', 'test_metrics': metrics})


if __name__ == '__main__':
    # debug=True is fine for local development only — use a production WSGI
    # server (gunicorn/waitress) behind Railway/Render in production, e.g.:
    #   gunicorn -w 2 -b 0.0.0.0:5000 truthShield_ml:app
    app.run(host='0.0.0.0', port=5000, debug=False)
