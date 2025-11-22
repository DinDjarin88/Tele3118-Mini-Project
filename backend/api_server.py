from flask import Flask, jsonify, request
from database import get_all, get_student, add_student, populate
from app import fetch_student_marks
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

# Immediately populate database after app creation, for Flask 3.x compatibility
try:
    students = fetch_student_marks()
except Exception as e:
    print("UDP fetch failed:", e)
    students = []
populate(students)


@app.route('/api/studentlist', methods=['GET'])
def student_list():
    return jsonify(get_all())

@app.route('/api/studentmark/<string:name>', methods=['GET'])
def student_mark(name):
    student = get_student(name)
    if student:
        return jsonify(student)
    else:
        return jsonify({"error": "Not found"}), 404

@app.route('/api/student', methods=['POST'])
def add():
    payload = request.get_json(force=True)
    add_student(payload['student'], payload['mark'])
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)
