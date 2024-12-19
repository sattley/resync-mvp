# ReSync MVP
ReSync Interview Challenge
<br>
<br>

# Backend Setup
1. **Navigate to the backend directory**:
   ```cd backend```

1. **Create and activate a virtual environment**:
   ```python3 -m venv env```
   ```source env/bin/activate```

1. **Install dependencies**:
   ```python3 -m pip install -r requirements.txt```

1. **Run the FastAPI server**:
   ```uvicorn main:app --reload```

<br>
<br>

# Frontend Setup

**_Important:_** Before starting the frontend, ensure that the backend server is running. Start the Uvicorn server by following the steps in the Backend Setup section. The backend should be accessible at http://127.0.0.1:8000. The frontend relies on this server to function correctly.

1. **Navigate to the frontend directory**:
   ```cd frontend```

1. **Install dependencies**:
   ```npm install```

1. **Start the Vite development server**:
   ```npm run dev```

1. **View the app in a browser :**
   Open your browser and go to:
   <http://localhost:5173/>
<br>
<br>

# Test Data
### Users to Login with

    Username: user1
    Password: U$er1-P@ssw0rd

    Username: user2
    Password: U$er2-P@ssw0rd

    Username: user3
    Password: U$er3-P@ssw0rd

### SMILES strings

    Name: oxidane
    SMILES: O

    Name: methanol
    SMILES: CO

    Name: Ethanol
    SMILES: CCO

    Name: Acetone
    SMILES: CC(C)=O

    Name: Benzene
    SMILES: c1ccccc1

    Name: Caffeine
    SMILES: Cn1cnc2c1c(=O)n(c(=O)n2C)C



