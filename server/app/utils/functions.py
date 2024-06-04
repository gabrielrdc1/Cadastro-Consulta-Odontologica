from datetime import datetime
from firebase_admin import auth
from flask import request, jsonify

def get_time_slots(start_time, end_time, interval):
    slots = []
    current_time = datetime.combine(datetime.today(), start_time)
    end_datetime = datetime.combine(datetime.today(), end_time)
    while current_time < end_datetime:
        slots.append(current_time.time())
        current_time += interval
    return slots

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