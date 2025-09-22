import pandas as pd
import numpy as np

data = pd.DataFrame({
  "CustomerID": [1,2,3,4],
  "Name": ["A","B","C","D"],
  "SensorType": ["Temperature","Humidity","SoilMoisture","Temperature"],
  "Age": [10,20,30,40],
  "Income": [3000,10000,5000,8000],
  "LoanAmount": [100000, None, 300000, 0],
  "LoanTerm": [12, 12, 36, 240],
  "CreditScore": [100, 100, 100, 90],
  "Default": [0, 0, 0, 1]
})

missing_values = data.isnull().sum()
duplicate_values = data.isnull().sum()
print("缺失", missing_values)
print("重复", duplicate_values)

data["age_valid"] = data["Age"].between(18, 70)
data["income_valid"] = data["Income"] > 2000
data["loan_valid"] = data["LoanAmount"] < (data["Income"] * 5)
data["crdit_valid"] = data["CreditScore"].between(80, 100)
data["valid"] = data[["age_valid", "income_valid", "loan_valid", "crdit_valid"]].all(axis=1)
print(data[["age_valid", "income_valid", "loan_valid", "crdit_valid", "valid"]].describe())

invalid_rows = data[~data["valid"]]
clean_rows = data[data["valid"]]
print("标记")
print(clean_rows.head())