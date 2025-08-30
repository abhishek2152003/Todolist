from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# MySQL database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'todo_app'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Create todos table if it doesn't exist
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS todos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            text VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()

# API Routes
@app.route('/api/todos', methods=['GET'])
def get_todos():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM todos ORDER BY created_at DESC')
    todos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    text = data.get('text')
    completed = data.get('completed', False)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO todos (text, completed) VALUES (%s, %s)', (text, completed))
    conn.commit()
    todo_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return jsonify({'id': todo_id, 'text': text, 'completed': completed})

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()
    completed = data.get('completed')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE todos SET completed = %s WHERE id = %s', (completed, todo_id))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'id': todo_id, 'completed': completed})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM todos WHERE id = %s', (todo_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)