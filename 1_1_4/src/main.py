import pandas as pd
import numpy as np

data = pd.DataFrame({
  "UserID": [1,2,3,4],
  "UserName": ["A","B","C","D"],
  "Gender": ["Male","Female","Male","Male"],
  "Age": [10,20,30,40],
  "Location": ["河南", "北京", "南京", "上海"],
  "LastLogin": [None, "2025", "2025", "2025"],
  "PurchaseAmount": [12, 12, 36, 240],
  "PurchaseCategory": ["电子产品", "生活用品", "服装", "食品"],
  "ReviewScore": [1, 2, 1, 5],
  "LoginFrequency": ["每日", "每周", "每月", "每日"]
})


print(data.head(5))

data = data.dropna()
data["Age"] = data["Age"].astype(int)
data["PurchaseAmount"] = data["PurchaseAmount"].astype(float)
data["ReviewScore"] = data["ReviewScore"].astype(int)

data = data[(data["Age"].between(18,70) &
             (data["PurchaseAmount"] > 0) &
             (data["ReviewScore"].between(0, 5))
             )]

data["PurchaseAmount"] = (data["PurchaseAmount"] - data["PurchaseAmount"].mean()) / data["PurchaseAmount"].std()
data["ReviewScore"] = (data["ReviewScore"] - data["ReviewScore"].mean()) / data["ReviewScore"].std()

data.to_csv("./save1.csv", index=False)
print(data.head())

print("每个分类用户数", data["PurchaseCategory"].value_counts())

print("不同性别平均购买", data.groupby("Gender")["PurchaseAmount"].mean())
bins = [18, 25, 30, 40, 99]
labels = ["18-25", "26-30", "31-40","40+"]
data["AgeRange"] = pd.cut(data["Age"], bins=bins, labels=labels, right=True)
print("不同年龄段用户数", data["AgeRange"].value_counts())

