import pandas as pd
import numpy as np

data = pd.DataFrame({
  "SensorID": [1,2,3,4],
  "Timestamp": [1,2,3,4],
  "SensorType": ["Temperature","Humidity","SoilMoisture","Temperature"],
  "Value": [100,200,300,400],
  "Location": [10,20,30,40],
})

result1 = data[["SensorType", "Value"]].groupby("SensorType").agg(["count", "mean"])
print("数量和平均")
print(result1)

location_stas = data[data["SensorType"].isin(["Temperature", "Humidity"])].groupby(["Location", "SensorType"])["Value"].mean().unstack()
print("位置传感器平均值")
print(location_stas)

data["isNormal"] = np.where(
    ((data["SensorType"] == "Temperature") & ((data["Value"] < -10) | (data["Value"] > 50))) |
    ((data["SensorType"] == "Humidity") & ((data["Value"] < 0) | (data["Value"] > 100)))
  , True, False)

print("异常值数量")
print(data["isNormal"].sum())

data["Value"].fillna(method="ffill", inplace=True)
data["Value"].fillna(method="bfill", inplace=True)

data1 = data.drop(columns=["isNormal"])
data1.to_csv("./test.csv")
print(data1.head())