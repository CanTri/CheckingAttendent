//
//  DetectedPerson.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 3/22/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import Foundation

struct DetectedPerson{
    var name: String
    var dx: Int
    var dy: Int
    var height: Int
    var width: Int
    
    init(name: String, dx: Int, dy: Int, height: Int, width: Int) {
        self.name = name
        self.dx = dx
        self.dy = dy
        self.height = height
        self.width = width
    }
}
