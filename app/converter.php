<?php
/**
 * Version : .5 (beta)
 * 
 * This source file is a strip down version of Zend Framework for Google Spreadsheet API.
 * More resource can be found at http://code.google.com/apis/spreadsheets/data/1.0/developers_guide_php.html
 * 
 * Please note that some of the variables are hard-coded.
 */

/*
 * Include library
 */
set_include_path('library/');

/*
 * XML parser
 */
require_once 'Quan/XMLParser.php';

require_once 'Zend/Loader.php';

/*
 * Imports
 */
Zend_Loader::loadClass('Zend_Http_Client');
Zend_Loader::loadClass('Zend_Gdata');
Zend_Loader::loadClass('Zend_Gdata_Docs');
Zend_Loader::loadClass('Zend_Gdata_ClientLogin');
Zend_Loader::loadClass('Zend_Gdata_Query');
Zend_Loader::loadClass('Zend_Gdata_Spreadsheets');
Zend_Loader::loadClass('Zend_Gdata_AuthSub');
Zend_Loader::loadClass('Zend_Gdata_App_AuthException');
Zend_Loader::loadClass('Zend_Gdata_Docs_Query');
Zend_Loader::loadClass('Zend_Gdata_App_Exception');

class SpreadsheetConverter
{
	/**
	 *Constructor
	 * 
	 * @param type $email
	 * @param type $password 
	 */
	public function __construct($email, $password)
	{
		try
		{
			$client = Zend_Gdata_ClientLogin::getHttpClient($email, $password, Zend_Gdata_Spreadsheets::AUTH_SERVICE_NAME);
		}
		catch (Zend_Gdata_App_AuthException $ae)
		{
			exit("Error: " . $ae->getMessage() . "\nCredentials provided were email: [$email] and password [$password].\n");
		}

		$this->gdClient = new Zend_Gdata_Spreadsheets($client);
		$this->feed = $this->gdClient->getSpreadsheetFeed();
		$this->currKey = '';
		$this->currWkshtId = '';
		$this->listFeed = '';
		$this->cellFeed = '';
		$this->rowCount = 0;
		$this->columnCount = 0;
		
		$this->init();
	}
	
	/*
	 * Initiate the app.
	 */
	public function init()
	{
		// Get the Spreadsheet.
		$this->promptForSpreadsheet();
		// Get the Worksheet withing the Spreadsheet.
		$this->promptForWorksheet();
		// Choose to feed by row or cell.
		$this->promptForFeedtype();
	}
	
	/**
	 * Retrieve all of the spreadsheets and set the key of chosen spreadsheet
	 */
	public function promptForSpreadsheet()
	{
		$spreadsheet_num = 0; // Zero based array.
		$feed = $this->gdClient->getSpreadsheetFeed();
		print "== Available Spreadsheets ==\n";
		$this->printFeed($feed);
		$currKey = explode('/', $feed->entries[$spreadsheet_num]->id->text);
		$this->currKey = $currKey[5];
	}
	
	/**
	 * Display all feeds.
	 * 
	 * @param type $feed 
	 */
	public function printFeed($feed)
	{
		$i = 0;
		foreach ($feed->entries as $entry)
		{
			if ($entry instanceof Zend_Gdata_Spreadsheets_CellEntry)
			{
				print $entry->title->text . ' ' . $entry->content->text . "\n";
			}
			else if ($entry instanceof Zend_Gdata_Spreadsheets_ListEntry)
			{
				print $i . ' ' . $entry->title->text . ' | ' . $entry->content->text . "\n";
			}
			else
			{
				print $i . ' ' . $entry->title->text . "\n";
			}
			$i++;
		}
	}
	
	/**
	 * Retrieve all worksheets of the selected spreadsheet.
	 */
	public function promptForWorksheet()
	{
		$query = new Zend_Gdata_Spreadsheets_DocumentQuery();
		$query->setSpreadsheetKey($this->currKey);
		$feed = $this->gdClient->getWorksheetFeed($query);
		print "== Available Worksheets ==\n";
		$this->printFeed($feed);
		$currWkshtId = split('/', $feed->entries[0]->id->text);
		$this->currWkshtId = $currWkshtId[8];
	}
	
	/**
	 * 
	 */
	public function promptForFeedtype()
	{
		// Feed by cell or list
		$this->listGetAction();
		
//		$this->cellGetAction(); // This method is still in the work.
	}
	
	/**
	 * Get all the row feed and pass it to the XMLParser classs.
	 */
	public function listGetAction()
	{
	    $query = new Zend_Gdata_Spreadsheets_ListQuery();
	    $query->setSpreadsheetKey($this->currKey);
	    $query->setWorksheetId($this->currWkshtId);
	    $this->listFeed = $this->gdClient->getListFeed($query);
	    print "entry id | row-content in column A | column-header: cell-content\n". 
	    "Please note: The 'dump' command on the list feed only dumps data until ". 
	    "the first blank row is encountered.\n\n";

	    $xmlParser = XMLParser::parseXML($this->listFeed);
	    print "\n";
	}
	
	public function cellGetAction()
	{
		$query = new Zend_Gdata_Spreadsheets_CellQuery();
		$query->setSpreadsheetKey($this->currKey);
		$query->setWorksheetId($this->currWkshtId);
		$query->setMinCol(1);
		$query->setMaxCol(10);
		$query->setMinRow(4);
		$query->setMaxRow(6);
		$this->cellFeed = $this->gdClient->getCellFeed($query);
		
		$this->printCellFeed($this->cellFeed);
	}
	
	public function printCellFeed($feed)
	{
		 $xmlParser = XMLParser::parseXMLByCell($feed);
	}

	public function printListFeed($feed)
	{
		$i = 0;
		foreach ($feed->entries as $entry)
		{
//			print $i . ' ' . $entry->title->text . ' | ' . $entry->content->text . "\n";
			print $i . ' ' . $entry->title->text . ' | ' . "\n";
//			print_r($entry) . ' ' . "\n";
			
			$i++;
			
			if ($i == 3)
			{
				break;
			}
		}
	}
}

function getInput($text)
{
    echo $text.': ';
//    return trim(fgets(STDIN));
}

/*
 * Google account ID and password.
 */
$email = 'quan.ngo@windwalker.com';
$pass = '1355beverly';
$sample = new SpreadsheetConverter($email, $pass);
?>
