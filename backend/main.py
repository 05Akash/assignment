from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Optional

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection helper
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="intern",
        user="postgres",
        password="qwerty",
        cursor_factory=RealDictCursor
    )

# Models
class QuotationBase(BaseModel):
    quotation_number: str
    date: date

class ItemBase(BaseModel):
    quotation_number: str
    item_code: str
    description: str
    qty: int
    pcs: int
    prices_high: float
    prices_medium: float
    prices_economical: float
    rod: float
    coating: float
    pre_process: float
    post_process: float
    packing: Optional[float] = None
    profit_margin: Optional[float] = None
    discount: Optional[float] = None

class ItemUpdate(BaseModel):
    packing: float
    profit_margin: float
    discount: float

    @validator('*')
    def values_required(cls, v):
        if v is None:
            raise ValueError('All fields are required')
        return v

# Initialize Database
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Create tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS quotations (
            quotation_number VARCHAR PRIMARY KEY,
            date DATE NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            quotation_number VARCHAR REFERENCES quotations(quotation_number),
            item_code VARCHAR NOT NULL,
            description TEXT NOT NULL,
            qty INTEGER NOT NULL,
            pcs INTEGER NOT NULL,
            prices_high DECIMAL(10,2) NOT NULL,
            prices_medium DECIMAL(10,2) NOT NULL,
            prices_economical DECIMAL(10,2) NOT NULL,
            rod DECIMAL(10,2) NOT NULL,
            coating DECIMAL(10,2) NOT NULL,
            pre_process DECIMAL(10,2) NOT NULL,
            post_process DECIMAL(10,2) NOT NULL,
            high_packing DECIMAL(10,2),
            high_profit_margin DECIMAL(10,2),
            high_discount DECIMAL(10,2),
            medium_packing DECIMAL(10,2),
            medium_profit_margin DECIMAL(10,2),
            medium_discount DECIMAL(10,2),
            economical_packing DECIMAL(10,2),
            economical_profit_margin DECIMAL(10,2),
            economical_discount DECIMAL(10,2)
        )
    """)

    # Insert sample data
    cur.execute("""
        INSERT INTO quotations (quotation_number, date)
        VALUES 
        ('QTN-23-12-2023-0001', '2023-12-23'),
        ('QTN-23-12-2023-0002', '2023-12-23')
        ON CONFLICT DO NOTHING
    """)

    cur.execute("""
        INSERT INTO items (
            quotation_number, item_code, description, qty, pcs,
            prices_high, prices_medium, prices_economical,
            rod, coating, pre_process, post_process
        )
        VALUES 
        (
            'QTN-23-12-2023-0001',
            'X72-02-00',
            'SC End mill Φ10 x 15 FL x 10 SH x 64 OAL',
            5, 21,
            3664.18, 2559.39, 1858.97,
            1000.00, 800.00, 600.00, 400.00
        ),
        (
            'QTN-23-12-2023-0002',
            'X72-03-00',
            'SC End mill Φ12 x 20 FL x 12 SH x 75 OAL',
            3, 15,
            4200.00, 3100.00, 2200.00,
            1200.00, 900.00, 700.00, 500.00
        )
        ON CONFLICT DO NOTHING
    """)

    conn.commit()
    conn.close()

# API Endpoints
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/quotations", response_model=List[QuotationBase])
def get_quotations():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM quotations ORDER BY date DESC")
    quotations = cur.fetchall()
    conn.close()
    return quotations

@app.get("/items/{quotation_number}")
def get_items(quotation_number: str):
    conn = get_db_connection()
    cur = conn.cursor()

    # Get quotation details
    cur.execute("SELECT * FROM quotations WHERE quotation_number = %s", (quotation_number,))
    quotation = cur.fetchone()

    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Get items for the quotation
    cur.execute("SELECT * FROM items WHERE quotation_number = %s", (quotation_number,))
    items = cur.fetchall()

    conn.close()
    return {
        "date": quotation["date"],
        "items": items
    }

@app.put("/items/{quotation_number}/{item_code}/{category}")
def update_item(quotation_number: str, item_code: str, category: str, item_update: ItemUpdate):
    if category not in ['high', 'medium', 'economical']:
        raise HTTPException(status_code=400, detail="Invalid category")

    conn = get_db_connection()
    cur = conn.cursor()

    # Map category to database columns
    column_mapping = {
        "high": ("high_packing", "high_profit_margin", "high_discount"),
        "medium": ("medium_packing", "medium_profit_margin", "medium_discount"),
        "economical": ("economical_packing", "economical_profit_margin", "economical_discount"),
    }

    columns = column_mapping[category]
    query = f"""
        UPDATE items 
        SET {columns[0]} = %s, {columns[1]} = %s, {columns[2]} = %s
        WHERE quotation_number = %s AND item_code = %s
        RETURNING *
    """

    try:
        cur.execute(query, [
            item_update.packing,
            item_update.profit_margin,
            item_update.discount,
            quotation_number,
            item_code
        ])
        updated_item = cur.fetchone()

        if not updated_item:
            raise HTTPException(status_code=404, detail="Item not found")

        conn.commit()
        return updated_item
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
