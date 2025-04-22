package com.inii.geoterra.development.interfaces

interface OnFragmentInteractionListener {
  fun onFragmentFinished() {
  }
  fun onFragmentFinished(pointLat : Double, pointLong : Double) {
  }
}