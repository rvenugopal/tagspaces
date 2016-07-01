/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isNode, isFirefox */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading map.ui.js ...');

  var TSCORE = require('tscore');
  var TSPOSTIO = require("tspostioapi");

  require('leaflet');
  require('leafletlocate');
  
  // TagSpaces Map
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showLocationNotFound);
    } else {
      TSCORE.showAlertDialog("Geolocation is not supported by this browser.");
    }
  }

  function showPosition(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
  }

  function showLocationNotFound(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        TSCORE.showAlertDialog("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        TSCORE.showAlertDialog("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        TSCORE.showAlertDialog("The request to get user location timed out.");
        break;
    }
  }

  var ACCESS_TOKEN = 'pk.eyJ1Ijoia3Jpc3RpeWFuZGQiLCJhIjoiY2lweHVlam5rMDA3Y2k0bTJ4Z3l2ZzFxdyJ9.6pyZff5AHe9xPRX7FcjwCw';
  var MB_ATTR = 'Map data &copy; <a href="http://tagspaces.org">TagSpaces</a>';
  var MB_URL = 'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=' + ACCESS_TOKEN;
  var OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var OSM_ATTRIB = '';
  var tagSpacesMapOptions = {
    //layers: [MB_ATTR],
    //center: [51.505, -0.09],
    zoomControl: true,
    detectRetina: true
  };
  var tagSpacesMap = L.map('mapTag', tagSpacesMapOptions);//.setView([51.505, -0.09], 13);
  //L.control.locate({
  //  position: 'topright',
  //  strings: {
  //    title: $.i18n.t('ns.dialogs:yourLocation') //
  //  }
  //}).addTo(tagSpacesMap);
  var marker;

  function showGeoLocation() {
    L.tileLayer(MB_URL, {
      attribution: MB_ATTR,
      id: 'tagSpacesMap'
    }).addTo(tagSpacesMap);

    var regExp = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;
    var coordinate = TSCORE.selectedTag;
    console.log(coordinate);
    var currentCoordinate = coordinate.split("-");

    if (!regExp.exec(currentCoordinate)) {
      tagSpacesMap.setView([54.5259614, +15.2551187], 5);
      L.marker([54.5259614, +15.2551187]).addTo(tagSpacesMap).bindPopup('TagSpaces');//.openPopup();
    } else {
      tagSpacesMap.setView(currentCoordinate, 13);
      L.marker(currentCoordinate).addTo(tagSpacesMap).bindPopup('Tag', {showOnMouseOver: true});//.openPopup();
      //addMarker(currentCoordinate);
    }
  }

  function addMarker(e) {
    // Add marker to map at click location; add popup window
    if (typeof(marker) === 'undefined') {
      marker = new L.marker(e.latlng, {
        draggable: true,
        showOnMouseOver: true
      }).update();
      //marker.valueOf().style.backgroundColor = 'green'; //or any color
      marker.addTo(tagSpacesMap);
    } else {
      marker.setLatLng(e.latlng);
    }
  }

  function onMapClick(e) {
    addMarker(e);
    //var popup = L.popup();
    //popup.setLatLng(e.latlng).setContent(e.latlng.toString()).openOn(tagSpacesMap);
  }

  function tagYourself() {
    tagSpacesMap.locate({
      setView: true,
      watch: true
    }) /* This will return map so you can do chaining */.on('locationfound', function(e) {
      var marker = L.marker([e.latitude, e.longitude]).bindPopup('Current position', {showOnMouseOver: true});
      var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
        weight: 1,
        color: 'blue',
        fillColor: '#cacaca',
        fillOpacity: 0.2
      });
      tagSpacesMap.addLayer(marker);
      tagSpacesMap.addLayer(circle);
    }).on('locationerror', function(error) {
      showLocationNotFound(error);
    });
  }

  function initMap() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
      var target = $(e.target).attr("href"); // activated tab
      if (target === "#geoLocation") {
        tagSpacesMap.invalidateSize();
      }
    });

    tagSpacesMap.on('resize', function() {
      tagSpacesMap.invalidateSize();
      //L.Util.requestAnimFrame(tagSpacesMap.invalidateSize,tagSpacesMap,!1,tagSpacesMap._container);
    });

    tagSpacesMap.on('click', onMapClick);

    showGeoLocation();

    //L.mapbox.accessToken = '<your access token here>';
    //L.mapbox.map('map', 'mapbox.streets')
    //.addControl(L.mapbox.geocoderControl('mapbox.places'));
  }

  // Public API definition
  exports.initMap = initMap;
  exports.tagYourself = tagYourself;
  exports.onMapClick = onMapClick;
  exports.addMarker = addMarker;
  exports.showGeoLocation = showGeoLocation;
  exports.getLocation = getLocation;
  exports.showPosition = showPosition;

});