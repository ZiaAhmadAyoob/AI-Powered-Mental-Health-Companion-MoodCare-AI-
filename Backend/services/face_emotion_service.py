import base64
import numpy as np
import cv2
from deepface import DeepFace

def analyze_face_emotion(image_base64: str) -> dict:
    """
    Receives a base64 image string from frontend webcam.
    Returns detected emotion using DeepFace pretrained model.
    """
    try:
        # decode base64 to image
        img_data   = base64.b64decode(image_base64.split(",")[-1])
        np_arr     = np.frombuffer(img_data, np.uint8)
        img        = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return _no_face_result("Could not decode image")

        # analyze with DeepFace (fastest backend = opencv)
        result = DeepFace.analyze(
            img,
            actions      = ["emotion"],
            detector_backend = "opencv",
            enforce_detection = False,   # don't crash if no face found
            silent       = True,
        )

        if not result:
            return _no_face_result("No face detected")

        face_data  = result[0]
        emotions   = face_data.get("emotion", {})
        dominant   = face_data.get("dominant_emotion", "neutral")
        confidence = round(emotions.get(dominant, 0), 1)

        # map DeepFace labels to our system labels
        label_map = {
            "happy":   "joy",
            "sad":     "sadness",
            "angry":   "anger",
            "fear":    "fear",
            "surprise":"surprise",
            "disgust": "disgust",
            "neutral": "neutral",
        }

        mapped = label_map.get(dominant.lower(), "neutral")

        return {
            "success":    True,
            "emotion":    mapped,
            "raw_emotion": dominant,
            "confidence": confidence,
            "all_emotions": {
                label_map.get(k.lower(), k): round(v, 1)
                for k, v in emotions.items()
            },
            "face_detected": True,
        }

    except Exception as e:
        return _no_face_result(str(e))


def _no_face_result(reason: str) -> dict:
    return {
        "success":      False,
        "emotion":      "neutral",
        "confidence":   0,
        "face_detected": False,
        "reason":       reason,
    }