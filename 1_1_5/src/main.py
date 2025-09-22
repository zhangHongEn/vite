import pandas as pd
import numpy as np

data = pd.DataFrame({
  "VehicleID": [1,2,3,4],
  "DriverName": ["A","B","C","D"],
  "Gender": ["Male","Female","Male","Male"],
  "Age": [10,20,30,40],
  "Speed": [1,2,3,4],
  "TravelDistance": [None, 10, 20, 30],
  "TrvalTime": [12, 12, 36, 240],
  "TrafficEvent": ["Normal", "Acc", "Jam", "Break"],
})



data = data.dropna()

data["Age"] = data["Age"].astype(int)
data["Speed"] = data["Speed"].astype(int)
data["TravelDistance"] = data["TravelDistance"].astype(float)
data["TrvalTime"] = data["TrvalTime"].astype(float)

data = data[
  (data["Age"].between(1, 100)) &
  (data["Speed"].between(0, 200)) &
  (data["TravelDistance"].between(1, 1000)) &
  (data["TrvalTime"].between(1, 200))
]

un_data = data[~(
  (data["Age"].between(1, 100)) &
  (data["Speed"].between(0, 200)) &
  (data["TravelDistance"].between(1, 1000)) &
  (data["TrvalTime"].between(1, 200))
)]

print("不合理数据", un_data)

print("不同性别平均车速时间", data.groupby("Gender").agg({
  "Speed": "mean",
  "TravelDistance": "mean",
  "TrvalTime": "mean"
}))

bins = [18, 20, 30, np.inf]
lables = ["A", "B", "C"]
data["AgeGroup"] = pd.cut(data["Age"], bins=bins, labels=lables, right=False)
print(data.value_counts("AgeGroup"))