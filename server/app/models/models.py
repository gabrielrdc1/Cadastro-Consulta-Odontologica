from app import db
import datetime

class Pacientes(db.Model):
    paciente_id = db.Column(db.Integer, primary_key=True)
    paciente_nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.datetime.now)
    
    def save(self):
        db.session.add(self)
        db.session.commit()

class Agenda(db.Model):
    agenda_id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.paciente_id'), nullable=False)
    dent_esp_id = db.Column(db.Integer, db.ForeignKey('dentista_especializacao.dent_espec_id'), nullable=False)
    data_consulta = db.Column(db.Date, nullable=False)
    hora_consulta = db.Column(db.Time, nullable=False)
    
    
    def save(self):
        db.session.add(self)
        db.session.commit()

class DentistaEspecializacao(db.Model):
    dent_espec_id = db.Column(db.Integer, primary_key=True)
    dentista_id = db.Column(db.Integer, db.ForeignKey('dentistas.dentista_id'), nullable=False)
    dentista_nome = db.relationship('Dentistas', back_populates='especializacoes')
    especializacao_id = db.Column(db.Integer, db.ForeignKey('especializacao.especializacao_id'), nullable=False)
    tempo = db.Column(db.Integer, nullable=False)
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        
class Dentistas(db.Model):
    dentista_id = db.Column(db.Integer, primary_key=True)
    firabase_uid = db.Column(db.String(100), nullable=False)
    dentista_nome = db.Column(db.String(100), nullable=False)
    dentista_email = db.Column(db.String(100), unique=True, nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.datetime.now)
    especializacoes = db.relationship('DentistaEspecializacao', back_populates='dentista_nome')
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        
class Especializacao(db.Model):
    especializacao_id = db.Column(db.Integer, primary_key=True)
    especializacao_nome = db.Column(db.String(100), nullable=False)
    
    def save(self):
        db.session.add(self)
        db.session.commit()