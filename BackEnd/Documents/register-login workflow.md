### **The request to register / login workflow of GPMS**

###### 

###### **1. User submits university email → RegistrationRequest created (Status: Pending)**

###### **2. System parses email → checks UniversityRecord table**

######    **- If Supervisor → just check email exists in UniversityRecord**

######    **- If Student → check email exists AND IsGraduate = true**

###### **3. Admin sees pending requests in dashboard**

###### **4. Admin approves → System automatically creates User account**

######    **using username \& password from UniversityRecord table**

###### **5. User can now login with university portal credentials**

