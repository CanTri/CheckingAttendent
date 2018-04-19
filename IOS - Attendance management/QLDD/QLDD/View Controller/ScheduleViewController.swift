//
//  ScheduleViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/22/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit
import SpreadsheetView

class ScheduleViewController: UIViewController, SpreadsheetViewDataSource, SpreadsheetViewDelegate {
    @IBOutlet weak var DetailCourseLabel: UILabel!
    
    var courses = [Course]()
    @IBOutlet weak var spreadsheetView: SpreadsheetView!
    
    //let dates = ["7/10/2017", "7/11/2017", "7/12/2017", "7/13/2017", "7/14/2017", "7/15/2017", "7/16/2017"]
    let days = ["MONDAY", "TUESDAY", "WEDNSDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
    let dayColors = [UIColor(red: 0.918, green: 0.224, blue: 0.153, alpha: 1),
                     UIColor(red: 0.106, green: 0.541, blue: 0.827, alpha: 1),
                     UIColor(red: 0.200, green: 0.620, blue: 0.565, alpha: 1),
                     UIColor(red: 0.953, green: 0.498, blue: 0.098, alpha: 1),
                     UIColor(red: 0.400, green: 0.584, blue: 0.141, alpha: 1),
                     UIColor(red: 0.835, green: 0.655, blue: 0.051, alpha: 1)]
    let hours = ["LT:7h30 - 9h10\nTH:7h30 - 9h30", "LT:9h30 - 11h10\nTH:9h30 - 11h10","LT:13h30 - 15h10\nTH:13h30 - 15h30","LT:15h30 - 17h10\nTH:15:30 - 17h30"]
    let evenRowColor = UIColor(red: 0.914, green: 0.914, blue: 0.906, alpha: 1)
    let oddRowColor: UIColor = .white
    var data = [
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
    ]
    
    var detailCourseNumber = Array(repeating: Array(repeating: -1, count: 4), count: 6) // assign index of course to data array
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
        DataHandlerFromCourses()
        
        spreadsheetView.dataSource = self
        spreadsheetView.delegate = self
        
        spreadsheetView.contentInset = UIEdgeInsets(top: 4, left: 0, bottom: 4, right: 0)
        
        spreadsheetView.intercellSpacing = CGSize(width: 4, height: 1)
        spreadsheetView.gridStyle = .none
        
        //spreadsheetView.register(DateCell.self, forCellWithReuseIdentifier: String(describing: DateCell.self))
        spreadsheetView.register(TimeTitleCell.self, forCellWithReuseIdentifier: String(describing: TimeTitleCell.self))
        spreadsheetView.register(TimeCell.self, forCellWithReuseIdentifier: String(describing: TimeCell.self))
        spreadsheetView.register(DayTitleCell.self, forCellWithReuseIdentifier: String(describing: DayTitleCell.self))
        spreadsheetView.register(ScheduleCell.self, forCellWithReuseIdentifier: String(describing: ScheduleCell.self))
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if Reachability.isConnectedToNetwork(){
            print("Internet Connection Available!")
            spreadsheetView.flashScrollIndicators()
            //getCoursesFromBase()
            //updateCourseData()
            reloadCoursesFromBase()
            
        }
        else{
            print("Internet Connection not Available!")
            DispatchQueue.main.async { // Correct
                let alert = UIAlertController(title: "Error", message: "Please check your internet connection to use this function!", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                
                self.present(alert, animated: true)
            }
            
            
        }
        
    }
    
    // MARK: DataSource
    
    func numberOfColumns(in spreadsheetView: SpreadsheetView) -> Int {
        return 1 + days.count
    }
    
    func numberOfRows(in spreadsheetView: SpreadsheetView) -> Int {
        return 1 + 1 + hours.count
    }
    
    func spreadsheetView(_ spreadsheetView: SpreadsheetView, widthForColumn column: Int) -> CGFloat {
        if case 0 = column {
            return 140
        } else {
            return 140
        }
    }
    
    func spreadsheetView(_ spreadsheetView: SpreadsheetView, heightForRow row: Int) -> CGFloat {
        if case 0 = row {
            return 0
        } else if case 1 = row {
            return 32
        } else {
            return 80
        }
    }
    
    func frozenColumns(in spreadsheetView: SpreadsheetView) -> Int {
        return 1
    }
    
    func frozenRows(in spreadsheetView: SpreadsheetView) -> Int {
        return 2
    }
    
    func spreadsheetView(_ spreadsheetView: SpreadsheetView, cellForItemAt indexPath: IndexPath) -> Cell? {
        if case (1...(days.count + 1), 1) = (indexPath.column, indexPath.row) {
            let cell = spreadsheetView.dequeueReusableCell(withReuseIdentifier: String(describing: DayTitleCell.self), for: indexPath) as! DayTitleCell
            cell.label.text = days[indexPath.column - 1]
            cell.label.textColor = dayColors[indexPath.column - 1]
            return cell
        } else if case (0, 1) = (indexPath.column, indexPath.row) {
            let cell = spreadsheetView.dequeueReusableCell(withReuseIdentifier: String(describing: TimeTitleCell.self), for: indexPath) as! TimeTitleCell
            cell.label.text = "TIME"
            return cell
        } else if case (0, 2...(hours.count + 2)) = (indexPath.column, indexPath.row) {
            let cell = spreadsheetView.dequeueReusableCell(withReuseIdentifier: String(describing: TimeCell.self), for: indexPath) as! TimeCell
            cell.label.text = hours[indexPath.row - 2]
            cell.backgroundColor = indexPath.row % 2 == 0 ? evenRowColor : oddRowColor
            return cell
        } else if case (1...(days.count + 1), 2...(hours.count + 2)) = (indexPath.column, indexPath.row) {
            let cell = spreadsheetView.dequeueReusableCell(withReuseIdentifier: String(describing: ScheduleCell.self), for: indexPath) as! ScheduleCell
            let text = data[indexPath.column - 1][indexPath.row - 2]
            if !text.isEmpty {
                cell.label.text = text
                let color = dayColors[indexPath.column - 1]
                cell.label.textColor = color
                cell.color = color.withAlphaComponent(0.2)
                cell.borders.top = .solid(width: 2, color: color)
                cell.borders.bottom = .solid(width: 2, color: color)
            } else {
                cell.label.text = nil
                cell.color = indexPath.row % 2 == 0 ? evenRowColor : oddRowColor
                cell.borders.top = .none
                cell.borders.bottom = .none
            }
            return cell
        }
        return nil
    }
    
    func DataHandlerFromCourses(){
            
    }
    
    /// Delegate
    
    func spreadsheetView(_ spreadsheetView: SpreadsheetView, didSelectItemAt indexPath: IndexPath) {
        print("Selected: (row: \(indexPath.row), column: \(indexPath.column))")
        if Int(indexPath.row) != 0 && Int(indexPath.row) != 1 {
            if Int(indexPath.column) != 0 {
                var myStr = "Nothing to show"
                let indexCourses = self.detailCourseNumber[indexPath.column-1][indexPath.row-2]
                if indexCourses != -1 {
                    myStr = ""
                    myStr += self.courses[indexCourses].code + " - " + self.courses[indexCourses].name + "\n"
                    myStr += "Class: " + self.courses[indexCourses].class_name + "\n"
                    myStr += "Total student: " + String(self.courses[indexCourses].total_stud)
                }
                 self.DetailCourseLabel.text = myStr
            }
        }
        
        
    }
    
    func getCoursesFromBase(){
        self.courses.removeAll()
        let tabBar = tabBarController as! BaseTabBarController
        for temp in tabBar.courses{
            self.courses.append(temp)
        }
        spreadsheetView.reloadData()
    }
    
    func reloadCoursesFromBase(){
        let tabBar = tabBarController as! BaseTabBarController
        tabBar.waitThreadToFinish.enter()
        tabBar.downloadCourse()
        tabBar.waitThreadToFinish.wait()
        self.getCoursesFromBase()
        self.updateCourseData()
//        tabBar.waitThreadToFinish.notify(queue: .main){
//            print("finished thread")
//            self.getCoursesFromBase()
//            self.updateCourseData()
//        }
        
    }
    func updateCourseData(){
        for (index,course) in courses.enumerated(){
            var myStringArr = course.schedule?.components(separatedBy: ";")
            for temp in myStringArr!{
                var scheduleStringArr = temp.components(separatedBy: "-")
                var a = Int(scheduleStringArr[0])
                var b = Int(a!/4)
                var c = Int(a! - b*4)
                data[b][c] = String(describing: course.code) + "-" + scheduleStringArr[2] + "\nRoom: " + scheduleStringArr[1]
                self.detailCourseNumber[b][c] = index
            }
        }
        
        spreadsheetView.reloadData()
    }


}
