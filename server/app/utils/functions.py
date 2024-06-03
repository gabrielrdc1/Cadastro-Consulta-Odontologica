from datetime import datetime
from firebase_admin import auth
from flask import request, jsonify

def get_time_slots(start_time, end_time, interval):
    time_slots = []
    current_time = start_time
    while current_time < end_time:
        time_slots.append(current_time)
        current_time = (datetime.combine(datetime.today(), current_time) + interval).time()
    return time_slots

def verify_token(usuario = True):
    id_token = request.headers.get('Authorization')
    if not id_token:
        return jsonify({'error': 'Token não fornecido'}), 401

    try:
        decoded_token = auth.verify_id_token(id_token)
        request.uid = decoded_token['uid']
        
    except auth.InvalidIdTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    except auth.ExpiredIdTokenError:
        return jsonify({'error': 'Token expirado'}), 401