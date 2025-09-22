import pandas as pd
import numpy as np

# 读取数据集
data = pd.DataFrame({
  "patientID": [1,2,3,3,4],
  "Age": [1,2,3,3,4],
  "BMI": [1,2,3,3,4],
  "BloodPressSure": [1,2,3,3,4],
  "CholeSterol": [1,2,3,3,4],
  "DaysInHospital": [1,2,3,3,4]
})

data["Risk"] = np.where(data["DaysInHospital"] > 1, "高风险", "低风险")
high_risk_count = data.groupby("Risk")["Risk"].count()["高风险"]
high_risk_ratio = high_risk_count / len(data)
low_risk_count = data.value_counts("Risk")["低风险"]
low_risk_ratio = low_risk_count / len(data)

print("高风险数量", high_risk_count)
print("高风险占比", high_risk_count / len(data))

print("低风险数量", low_risk_count)
print("低风险占比", low_risk_count / len(data))

data["BMIRange"] = pd.cut(data["BMI"], labels=["便瘦", "正常", "肥胖"], bins=[0, 2, 3, np.inf])
bmi_risk_rate = data.groupby("BMIRange")["Risk"].apply(lambda x: (x == "高风险").mean())
bmi_count = data["BMIRange"].value_counts()
print(data.head())

print("高风险比例和数量")
print(bmi_risk_rate)
print(bmi_count)

# 3. 统计不同年龄区间中高风险患者的比例和统计不同年龄区间中的患者数
age_bins = [0, 1, 2, 3, np.inf]
age_labels = ["小", "中", "老", "死"]
data["AgeLabel"] = pd.cut(data["Age"], bins=age_bins, labels=age_labels)
age_risk_rate = data.groupby("AgeLabel")["Risk"].apply(lambda x: (x == "高风险").mean())
age_count = data.value_counts("AgeLabel")
print("不同年龄比例和数量")
print(age_risk_rate)
print(age_count)
