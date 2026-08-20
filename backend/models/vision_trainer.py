"""
Vision Model Trainer Pipeline for Industrial Casting Impeller Defect Images.
Loads images from backend/data/casting_512x512/ (def_front vs ok_front), extracts features,
trains a defect classification model, and saves model metrics.
"""

import os
import glob
import pickle
import numpy as np
from typing import Dict, Any, Tuple
from PIL import Image

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "casting_512x512")
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trained_vision_model.pkl")

def extract_image_features(img_path: str, target_size=(64, 64)) -> np.ndarray:
    """Resizes and flattens casting image into feature vector."""
    try:
        img = Image.open(img_path).convert('L').resize(target_size)
        arr = np.array(img, dtype=np.float32) / 255.0
        return arr.flatten()
    except Exception as e:
        return None

def train_casting_vision_model() -> Dict[str, Any]:
    """Trains a classifier over defective vs nominal casting images."""
    def_dir = os.path.join(DATA_DIR, "def_front")
    ok_dir = os.path.join(DATA_DIR, "ok_front")

    if not os.path.exists(def_dir) or not os.path.exists(ok_dir):
        return {"status": "error", "message": "Casting dataset directory not found."}

    def_files = glob.glob(os.path.join(def_dir, "*.jpeg"))
    ok_files = glob.glob(os.path.join(ok_dir, "*.jpeg"))

    X, y = [], []

    print(f"[VISION TRAIN] Loading {len(def_files)} defective casting images & {len(ok_files)} nominal casting images...")

    for f in def_files[:150]:
        feats = extract_image_features(f)
        if feats is not None:
            X.append(feats)
            y.append(1) # 1 = Defective

    for f in ok_files[:150]:
        feats = extract_image_features(f)
        if feats is not None:
            X.append(feats)
            y.append(0) # 0 = Nominal OK

    X = np.array(X)
    y = np.array(y)

    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)

    print(f"[VISION TRAIN] Casting Classifier Trained -> Accuracy: {acc*100:.2f}%, Precision: {prec*100:.2f}%, Recall: {rec*100:.2f}%")

    model_data = {
        "classifier": clf,
        "metrics": {"accuracy": acc, "precision": prec, "recall": rec},
        "sample_count": len(X)
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model_data, f)

    return model_data

if __name__ == '__main__':
    train_casting_vision_model()
