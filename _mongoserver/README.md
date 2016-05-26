# taxibeam 2
Taxi-Beam MongoDB




#MongoDB Install  v3.0  ON  Ubuntu 14.04

- ref https://docs.mongodb.org/v3.0/tutorial/install-mongodb-on-ubuntu/

1. sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

2. echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list

3. sudo apt-get update

4. sudo apt-get install -y mongodb-org




## Run MongDB 

sudo service mongod start

## Stop MongDB

sudo service mongod stop

## Restart

sudo service mongod restart





### Add Data & Retore 

( จาก zip file ที่แนบมา  )

unzip mongodump160311.zip -d 

mongorestore data/backup/16-03-11/


### Backup 

mongodump --out data/backup/16-03-11

zip -r mongodump160311.zip data/backup/16-03-11/





