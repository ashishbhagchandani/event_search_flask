from flask import Flask, render_template, send_from_directory, request, jsonify
from geolib import geohash
import requests
from flask_cors import CORS


app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)
@app.route('/')
def home():
    return send_from_directory('static', 'home.html')

@app.route('/ticketmastersearch', methods=['POST','GET'])
def ticketmasterSearch():
    keyword = request.args.get('keyword')
    segmentId = request.args.get('segmentId')
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    radius = request.args.get('radius')
    locationhash = geohash.encode(lat, lng, 7)
    url = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey='
    url += '&keyword=' + keyword
    if segmentId != 'undefined':
        url += '&segmentId=' + segmentId
    url += '&radius=' + radius
    url += '&unit=miles'
    url += '&geoPoint=' + locationhash
    # print(url)
    ticketmaster_response = requests.get(url).json()
    ticketmaster_response = jsonify(ticketmaster_response)    
    return ticketmaster_response

@app.route('/ticketmastereventdetail', methods=['POST','GET'])
def ticketmasterEventDetail():
    id = request.args.get('id')
    url = 'https://app.ticketmaster.com/discovery/v2/events/'
    url += id 
    url += '?apikey='
    ticketmaster_response = requests.get(url).json()
    ticketmaster_response = jsonify(ticketmaster_response)  
    print(url)  
    return ticketmaster_response

@app.route('/ticketmastervenuedetail', methods=['POST','GET'])
def ticketmasterVenueDetail():
    venue = request.args.get('venue')
    url = 'https://app.ticketmaster.com/discovery/v2/venues'
    url += '?apikey=&keyword='
    url += venue 
    print(url)
    ticketmaster_response = requests.get(url).json()
    ticketmaster_response = jsonify(ticketmaster_response)    
    print(url)
    return ticketmaster_response



if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
