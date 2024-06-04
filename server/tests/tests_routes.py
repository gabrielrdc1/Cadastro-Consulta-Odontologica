from app.controllers.routes import create_paciente
from app import app

def test_criar_paciente(authenticated_client):
    response = authenticated_client.post('/api/pacientes', json={
        'nome': 'Teste',
        'email': 'teste@gmail.com',
        'password': '123456',    
    })
    assert response.status_code == 201

def test_get_pacientes(authenticated_client):
    response = authenticated_client.get('/api/pacientes')
    assert response.status_code == 200
    
def test_patch_paciente(authenticated_client):
    response = authenticated_client.patch('/api/pacientes', json={
        'nome': 'Teste',
        'email': 'teste1@gmail.com',
    })
    assert response.status_code == 200
    
    
