import pandas as pd


# 读取数据集
data = pd.DataFrame({
  "patientID": [1,2,3,3,4],
  "mpg": [1,2,3,3,4],
  "displacement": [1,2,3,3,4],
  "cylinders": [1,2,None,3,4],
  "weight": [1,2,3,3,4],
  "horsepower": [1,None,"3",3,4]
})

print(data.dtypes)


print("空数据", data.isnull().sum())
data.dropna()
print(data)

data["horsepower"] = pd.to_numeric(data["horsepower"], errors="coerce")
data = data.dropna(subset=["horsepower"])
print("数据类型", data)

print("空数据", data.isnull().sum())


from sklearn.preprocessing import StandardScaler
numerical_features = ["displacement", "horsepower", "weight"]
scaler = StandardScaler()
data[numerical_features] = scaler.fit_transform(data[numerical_features])

print(data)

from sklearn.model_selection import train_test_split
selected_features = ['cylinders', 'displacement', 'horsepower', "weight"]
X = data[selected_features]
y = data["mpg"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


cleaned_data = X.copy()
cleaned_data["mpg"] = y

cleaned_data.to_csv("./out1.csv", index=False)


# # 制定数据清洗规范
# 1. 数据加载： read_csv和read_excel, 确保文件路径正确
# 2. 数据预览： data.head() 预览前5条数据
# 3. 处理脏数据：缺失值处理：扫描正表，删除包含缺失值的航 也可以填充 确保数据完整性
#   重复纸处理：扫描正个表删除或修改包含重复纸的航  
# 4. 数据类型转换将howrpser整个对象转换为树枝累心gg，对于无法转换的数据转换成空再进行删除
# 5. 数据标准化处理：standardscaler 均值为0 标准差为1
#   归一化处理：minmaxscaler吧数据轨道0到1之间


# 数据标注规范
# 1. 选择特征和目标变量：特征值的选择X最影响目标结果的特征，y最终的结果根据业务需求和数据特性，选择对燃油效率预测最有效的特征[x.,x,x,x,x,x,], 将mpg设为目标变量并进行标注
# 2. 数据的划分：将数据划分为训练节和测试机额一般按照8:2划分
# 3. 保存清洗后的数据：将标注好的数据集一文件保存
# 总结：数据加载、数据预览、处理脏数据、数据标准化、特征选择、数据标注、数据保存
