import pytest
from app.__init__ import app, db
from app.models.models import Pacientes, Agenda, DentistaEspecializacao, Dentistas, Especializacao

@pytest.fixture
def authenticated_client(test_client):
    usuario = Pacientes(nome='Teste', email='teste@teste.com', uid='123')
    db.session.add(usuario)
    db.session.commit()

    with test_client.session_transaction() as session:
        session['uid'] = '123'

    return test_client
@pytest.fixture
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
        db.session.remove()
        db.drop_all()