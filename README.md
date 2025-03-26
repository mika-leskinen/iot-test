# iot-test [work in progress]

## General

This is an example of a possible IoT solution, complete with a data collection device (Raspberry Pi), cloud backend (Azure VM) and a data visualization frontend (ReactJS web app).

The VPN part is used as an example for implementing remote device management, and is not mandatory for the operation of the IoT system itself.

Clone the project to your development machine and cd to the project folder:

```bash
git clone https://github.com/mika-leskinen/iot-test.git
cd ./iot-test
```

## Raspberry Pi setup

See https://www.raspberrypi.com/documentation/computers/getting-started.html

## Server setup

### Set up a virtual machine on Azure (or AWS or Digital Ocean or whatever)

https://learn.microsoft.com/en-us/azure/virtual-machines/windows/quick-create-portal

### Install docker on the cloud VM (ubuntu 22.04 here)

https://docs.docker.com/engine/install/ubuntu/

## [optional] VPN setup

Docs for the image used here:
https://hub.docker.com/r/kylemanna/openvpn/

NOTE: Create an inbound port rule for the cloud VM (allow 51194/udp).

SSH to the VM, then:

```bash
# on the server:

mkdir -p ~/devel/openvpn-server
cd ~/devel/openvpn-server

# generate initial openvpn config files:
docker run -v ./ovpn-data:/etc/openvpn --rm kylemanna/openvpn ovpn_genconfig -u udp://SERVER_IP_HERE:51194

# NOTE: add new line with "topology subnet" to the end of the ./ovpn-data/openvpn.conf file:
echo "topology subnet" | sudo tee -a ./ovpn-data/openvpn.conf

# init cert stuff (note down the passphrase for later):
# asks for "New CA Key Passphrase:" twice, then the same passphrase twice more
docker run -v ./ovpn-data:/etc/openvpn --rm -it kylemanna/openvpn ovpn_initpki

# generate client config for the raspberry pi:
# asks the passphrase again
docker run -v ./ovpn-data:/etc/openvpn --rm -it kylemanna/openvpn easyrsa build-client-full raspberry nopass

# generate client config(s) for dev machine(s):
# asks the passphrase yet again
docker run -v ./ovpn-data:/etc/openvpn --rm -it kylemanna/openvpn easyrsa build-client-full dev nopass

# create folder for client configs and retrieve the config files from openvpn-server container:
mkdir ./clients
docker run -v ./ovpn-data:/etc/openvpn --rm kylemanna/openvpn ovpn_getclient raspberry > ./clients/raspberry.ovpn
docker run -v ./ovpn-data:/etc/openvpn --rm kylemanna/openvpn ovpn_getclient dev > ./clients/dev.ovpn

# check if ./clients folder looks ok (should have two .ovpn files in it):
ls -al ./clients

# NOTE: delete or comment out this last line on the config (.ovpn) files to avoid routing all traffic through the VPN:
# # redirect-gateway def1

# setting up static IPs for clients (here the default ip range is 192.168.255.0/24):

# dev machine IP will be 192.168.255.10
echo "ifconfig-push 192.168.255.10 255.255.255.0" | sudo tee ./ovpn-data/ccd/dev

# raspberry pi IP will be 192.168.255.11
echo "ifconfig-push 192.168.255.11 255.255.255.0" | sudo tee ./ovpn-data/ccd/raspberry

# running the openvpn server container in the background:

# copy the "server/openvpn-server/docker-compose.yml" file from this project to the server:
# on your dev machine, in the root folder of this project:
# scp ./server/openvpn-server/docker-compose.yml USER@SERVER_IP:devel/openvpn-server

# finally, on the VM machine again (in ~/devel/openvpn-server):
docker compose up -d

# see logs with:
docker compose logs -f -n 200

# last line of the logs should look something like this:
# openvpn-server  | Fri Feb  7 12:17:09 2025 Initialization Sequence Completed

```

On your dev machine:

```bash
# download openvpn client configs from the server:
scp -r USER@SERVER_IP:devel/openvpn-server/clients ./openvpn-clients

# NOTE: if you skipped this step before, delete or comment out this last line on the config (.ovpn) files now to avoid routing all traffic through the VPN:
# # redirect-gateway def1
# TODO: there's probably a setting for disabling this in the first place

# install openvpn package:
sudo apt update && sudo apt install openvpn

# connect to the openvpn server with your "dev" config:
sudo openvpn ./openvpn-clients/dev.ovpn

# the output should look something like this:
# 2025-02-07 14:26:01 Initialization Sequence Completed

# finally, copy the "raspberry" client config to the Raspberry Pi (goes to home folder of USER):
scp ./openvpn-clients/raspberry.ovpn USER@RASPI_IP:raspberry.ovpn
```

For setting up automatic VPN connection on startup on the RasPi, SSH to the Pi, then

```bash
# on the RasPi:

# create folder for openvpn client:
mkdir -p ~/devel/openvpn-client
cd ~/devel/openvpn-client

# move the previously uploaded "raspberry" openvpn config file here (as profile.ovpn):
mv ~/raspberry.ovpn ./profile.ovpn

# copy the files in raspberry-pi/openvpn-client of this project here as well
# on your dev machine, in the root folder of this project:
# scp -r ./raspberry-pi/openvpn-client/* USER@RASPI_IP:devel/openvpn-client

# on the RasPi again

# for good measure, make the "initvpn.sh" entrypoint file executable:
chmod +x ./initvpn.sh

# build a custom docker image for openvpn (see Dockerfile and initvpn.sh for details):
docker build -t openvpn-client .

# finally, start the openvpn client container in the background:
docker compose up -d

# see logs with:
docker compose logs -f -n 200

# last line of the logs should look something like this:
# openvpn-client  | 2025-02-07 12:44:55 Initialization Sequence Completed

```

At this point, the Raspberry Pi should be accessible at IP address 192.168.255.11 on the VPN. Connect your dev machine to the VPN as described above, and access the Pi with:

```bash
# USER should be your Raspberry Pi username
ssh USER@192.168.255.11
```

## IoT backend application (on the VM)

```bash
# TODO
```

## Data collection application (on the Raspberry Pi)

```bash
# TODO
```

## Visualization frontend application (ReactJS static web app on the VM)

```bash
# TODO
```

## Project requirements

Current state:

- ✅ Done
- ❌ Not done

### Grade 1

- ✅ General
  - ✅ N/A
  - ✅ Architectural design document (all components, data flow, services)
  - ✅ Separate architectural design document for IoT device (applications and services)
  - ✅ N/A
  - ✅ N/A

### Grade 2

- ✅ IoT device features:
  - ✅ Measurement data is read from sensors
  - ✅ Measurement data is stored locally
  - ✅ Measurement data is sent to the cloud

### Grade 3

- ✅ Cloud service features:
  - ✅ Cloud services are initialized as per architectural design document
  - ✅ Measurement data is successfully received from IoT device and stored in the cloud
  - ✅ Measurement data is saved to a secondary (archive) storage in the cloud
  - ✅ Measurement data is received from authorized devices only

### Grade 4

- ❌ API features
  - ✅ Cloud service has an API for fetching measurement data
  - ❌ API provides aggregated data (hourly average) for a selected measurement
  - ❌ API has an authentication/authorization mechanism in place

### Grade 5

- ❌ System has a feature for logging alarm events when a given measurement value is outside allowed limits
- ❌ System has a web-based user interface with the following features:
  - ✅ Device/measurement selection
  - ✅ Displaying selected measurements within a selected timespan in a chart
  - ❌ Exporting selected measurements to a CSV file
  - ❌ Displaying logged alarm events
