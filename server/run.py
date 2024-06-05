import os
from app import app
from dotenv import load_dotenv

load_dotenv()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')