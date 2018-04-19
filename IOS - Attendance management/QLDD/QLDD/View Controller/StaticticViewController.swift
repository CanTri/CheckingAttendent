//
//  StaticticTableViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/25/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class StaticticViewController: UIViewController, UITableViewDelegate, UITableViewDataSource  {
    
    var courseStatic: CourseStatistic?
    //@IBOutlet weak var PercentAbsenceLabel: UILabel!
    @IBOutlet weak var TotalAbsenceLabel: UILabel!
    @IBOutlet weak var HistoryTableView: UITableView!
    override func viewDidLoad() {
        super.viewDidLoad()

        HistoryTableView.delegate = self
        HistoryTableView.dataSource = self
    }
    
    override func viewWillAppear(_ animated: Bool) {
        UpdateStatistic()
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return (self.courseStatic?.attendanceDetails.count)!
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = self.HistoryTableView.dequeueReusableCell(withIdentifier: "statisticCell") as! StatisticTableViewCell
        let attendanceDetail = self.courseStatic?.attendanceDetails[indexPath.row]
        cell.HIstoryDateLabel.text = attendanceDetail?.created_at[0 ..< 10]
        if attendanceDetail?.type == 1{
            cell.HIstoryStatusDateLabel.text = "Present"
            cell.HIstoryStatusDateLabel.textColor = UIColor.blue
        }
        return cell
    }
    
    func UpdateStatistic(){
//        var percent = 0
//        if (courseStatic?.attendanceCounts)! != 0 {
//            percent = ((courseStatic?.absenceCounts)!/(courseStatic?.attendanceCounts)!) * 100
//        }
        TotalAbsenceLabel.text = "  Total absence: " + String((courseStatic?.absenceCounts)!)
        //PercentAbsenceLabel.text = "Percent Absence: " + String(format: "%.2f", percent) + "%" + "  "
        
    }
    

    

}
extension String {
    
    var length: Int {
        return self.characters.count
    }
    
    subscript (i: Int) -> String {
        return self[i ..< i + 1]
    }
    
    func substring(fromIndex: Int) -> String {
        return self[min(fromIndex, length) ..< length]
    }
    
    func substring(toIndex: Int) -> String {
        return self[0 ..< max(0, toIndex)]
    }
    
    subscript (r: Range<Int>) -> String {
        let range = Range(uncheckedBounds: (lower: max(0, min(length, r.lowerBound)),
                                            upper: min(length, max(0, r.upperBound))))
        let start = index(startIndex, offsetBy: range.lowerBound)
        let end = index(start, offsetBy: range.upperBound - range.lowerBound)
        return String(self[start ..< end])
    }
    
}

