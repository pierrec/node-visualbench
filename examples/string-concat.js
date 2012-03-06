#!/usr/bin/env node

var bench = require('..')('string-concat')

var stringCount = 1000
var stringSize = 100
var string = new Array(stringSize + 1).join("x")

var array = new Array(stringCount)
for (var i = 0; i < stringCount; i ++) array[i] = string

function arrayJoinPrebuilt () {
  return array.join("")
}

function arrayJoinNewArray () {
  var a = new Array(stringCount)
  for (var i = 0; i < stringCount; i ++) a[i] = string
  return a.join("")
}

function arrayJoinPush () {
  var a = []
  for (var i = 0; i < stringCount; i ++) a.push(string)
  return a.join("")
}

function strcat () {
  var s = ""
  for (var i = 0; i < stringCount; i ++) s += string
  return s
}

// exports.compareCount = 20;
exports.time = 1000;
exports.compare =
  { arrayJoinPrebuilt: arrayJoinPrebuilt
  , arrayJoinNewArray: arrayJoinNewArray
  , arrayJoinPush: arrayJoinPush
  , strcat: strcat
  }

bench.runMain()
