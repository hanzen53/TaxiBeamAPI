# taxibeam 2
Taxi-Beam Project

ต้องการ

  NodeJs  , bower , pm2
  
******************************
Nodejs ubuntu 15.X  install 

 wget -qO- https://deb.nodesource.com/setup_5.x | sudo bash -
 
 sudo apt-get install --yes nodejs

*****************************

##1 add git 

git clone https://github.com/Ecartstudio/taxibeam.git

##2  install app taxibeam

cd  taxibeam

npm install

##3 install bower

sudo npm install bower -g

bower install 

##4 Install pm2  ( https://github.com/Unitech/pm2 )

sudo npm install pm2 -g


##5 Run ( Enable load-balancer and cluster features )

  pm2 start app.js        


** check 

pm2 list                      

( List all processes started with PM2 )

pm2 monit                     

( Display memory and cpu usage of each app )




************************

## Config 

ใน /config/config.js

เปลี่ยน DB_HOST ชี้ Host mongodb และ domain callcenter

ที่  PRODUCTION


  APP_NAME: "Taxi",

  APP_VERSION: "1.0.1",

  SERVER_PORT: 80,

  DB_HOST: "ecvttaxidb1.ecartstudio.com",
  
  DB_PORT: "27017",
  
  DB_NAME: "taxi",
  
  DB_USER: "",
  
  DB_PASSWORD: "",
  
  testhostcallcenter : "callcenter-test.taxi-beam.com",
  
  hostcallcenter : "callcenter.taxi-beam.com",
  
  drvsearchpsg_radian: 50000,
  
  drvsearchpsg_amount: 50
		
*****************************



## Binding 2 Domain 

    1. สำหรับผู้โดยสาร ( lite.taxi-beam.com   )
    
    2. สำหรับ callcenter ( callcenter.taxi-beam.com)
    
Path Domain 

lite.taxi-beam.com และ callcenter.taxi-beam.com

    ชี้ไปที่ /


  



