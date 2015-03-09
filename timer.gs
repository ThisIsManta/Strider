/*
How to use this Google Script
1. Go to your Google Drive
2. Click New > More > Connect more apps
3. Type "Script" into the search box
4. Find "Google Apps Script" and click Connect
5. Close the dialog
6. Click New > More > Google Apps Script
7. Click "Script as Web App" under "Create script for" section
8. Replace Code.gs with this file
9. Click File > Save
10. Type your project name (up to you) and click OK
10. Click Run > initializeForTheFirstTime
11. Click Continue
12. Click Accept
13. Click File > Manage versions...
14. Click Save New Version
15. Click OK to close this dialog
16. Click Publish > Deploy as Web App
17. Select your latest project versions
18. Select "Anyone, even anonymous" under "Who has access to the app" section
19. Click Deploy
20. Click OK

If you want to modify this script, you will need to repeat step 13 to 20 over again.
*/

function doGet(e) {
	var lock = LockService.getPublicLock();
	lock.waitLock(10000);

	try {
		// next set where we write the data - you could write to multiple/alternate destinations
		var book = SpreadsheetApp.openById(e.parameter.book);

		var targetKeyColumnIndex = parseInt(e.parameter.key);
		var targetValueColumnIndex = parseInt(e.parameter.value);
		var targetNameColumnIndex = parseInt(e.parameter.name);

		var numbs = e.parameter.numbs.split(',');
		var times = e.parameter.times.split(',');
		var names = new Array(numbs.length);

		var affectedRowNumber = 0;

		for (var shx = 0; shx < book.getSheets().length; shx++) {
			var sht = book.getSheets()[shx];
			if (sht.getSheetName().toUpperCase() !== 'TIMELINE' && sht.getSheetName().toUpperCase() !== 'ALL') {
				var lst = sht.getRange(1, targetKeyColumnIndex, sht.getLastRow()).getValues();
				for (var row = 0; row < sht.getLastRow() ; row++) {
					for (var idx = 0; idx < numbs.length; idx++) {
						if (lst[row][0] === numbs[idx]) {
							sht.getRange(row + 1, targetValueColumnIndex).setValue(times[idx]);
							names[idx] = sht.getRange(row + 1, targetNameColumnIndex).getValue();
							affectedRowNumber++;
						}
					}
				}
			}
		}

		return ContentService.createTextOutput('afterPublish(' + JSON.stringify({ status: "success", affectedRowNumber: affectedRowNumber, names: names }) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);

	} catch (e) {
		return ContentService.createTextOutput('afterPublish(' + JSON.stringify({ status: "error", error: e }) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);

	} finally {
		lock.releaseLock();
	}
}

function initializeForTheFirstTime() {
	SpreadsheetApp.getActiveSpreadsheet();
}