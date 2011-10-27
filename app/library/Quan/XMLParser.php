<?php
/**
 * Version : .02 (beta)
 * 
 * The purpose of this class is to turn the feed into an XML file and save it relatively to this doc location.
 * 
 */
class XMLParser
{
	/**
	 * The Google client login URI
	 *
	 */
	const CLIENTLOGIN_URI = 'https://www.google.com/accounts/ClientLogin';
	
	public static $dom = '';
	
	/**
	 * Create XML document and parse the feed.
	 * 
	 * @param type $feed 
	 */
	public static function parseXML($feed)
	{
		$dom = self::$dom;
		$dom = new DOMDocument('1.0');
		
		$root = $dom->createElement('root');
		$root = $dom->appendChild($root);
		
		// <assets />
		$assets = $dom->createElement('assets');
		$assets = $root->appendChild($assets);
		
		foreach ($feed->entries as $entry)
		{
			$rowData = $entry->getCustom();
			
			$values = array();
			 
			foreach($rowData as $customEntry)
			{
				$values[$customEntry->getColumnName()] = $customEntry->getText();
			}
			
			$item = $dom->createElement('item');
			$item = $assets->appendChild($item);
			
			self::manageValues($values, $item, $dom);
		}
		
		$dom->formatOutput = true;
		$dom->save("test.xml");
	}
	
	/**
	 * Parse the individual cell.
	 * 
	 * @param type $feed 
	 */
	public static function parseXMLByCell($feed)
	{
		$dom = self::$dom;
		
		$dom = new DOMDocument('1.0');
		$root = $dom->createElement('root');
		$root = $dom->appendChild($root);
		
		// <assets />
		$assets = $dom->createElement('assets');
		$assets = $root->appendChild($assets);
		
		print "\n";
			
		$i = 0; // Represent column number.
		foreach ($feed->entries as $entry)
		{
//			print  "<p> [$i] " . $entry->content->text . '</p>' . "\n";
//			print  "<p> [$i] " . $entry->getDOM(). '</p>' . "\n";
			
			if ($i == 0)
			{
				$item = $dom->createElement('item');
				$item = $assets->appendChild($item);
			}
			
			switch ($i)
			{
				case 0 :
					$item_name = $entry->content->text;
					$name_elem = $dom->createElement('name');
					$name_elem = $item->appendChild($name_elem);
					$name_elem->appendChild($dom->createTextNode($item_name));

				break;

				case 1 :
					$file_type = $entry->content->text;
					self::createElem('file_type', $file_type, $item, $dom);
				break;

				case 2 :
					self::createElem('location', $entry->content->text, $item, $dom);
				break;
				
				case 3 :
					self::createElem('url', $entry->content->text, $item, $dom);
				break;
				
				case 4 :
					self::createElem('top_level_id', $entry->content->text, $item, $dom);
				break;
				
				case 5 :
					self::createElem('second_level_id', $entry->content->text, $item, $dom);
				break;
				
				case 6 :
					self::createElem('tag', $entry->content->text, $item, $dom);
				break;
				
				case 7 :
					self::createElem('desc', $entry->content->text, $item, $dom);
				break;
				
				case 8 :
					self::createElem('synopsis', $entry->content->text, $item, $dom);
				break;
				
				case 9 :
					self::createElem('synopsis_cont', $entry->content->text, $item, $dom);
				break;
			}
			
			$i++;
			if ($i == 10)
			{
				$i = 0;
			}
		}
		
		$dom->formatOutput = true;
		$dom->save("test.xml");
	}
	
	/**
	 * Assign XML element to a particular cell.
	 * 
	 * @param type $values
	 * @param type $item
	 * @param type $dom 
	 */
	function manageValues($values, $item, $dom)
	{
		$cells = array();
		$cells['name'] = 'evenstartdatabase';
		$cells['file_type'] = '_cpzh4';
		$cells['location'] = '_cre1l';
		$cells['url'] = '_chk2m';
		$cells['top_level_id'] = '_ciyn3';
		$cells['second_level_id'] = '_ckd7g';
		$cells['tag'] = '_clrrx';
		$cells['desc'] = '_cyevm';
		$cells['synopsis'] = '_cztg3';
		$cells['synopsis_cont'] = '_d180g';
		
		foreach($cells as $elem => $cell)
		{
			$value = '';
			if (isset ($values[$cell]))
			{
				$value = $values[$cell];
			}
			
			self::createElem($elem, $value, $item, $dom);
		}
	}
	
	/**
	 * Generate XML markup and append it to the $dom.
	 * 
	 * @param type $elem
	 * @param string $value
	 * @param type $parent
	 * @param type $dom
	 * @return type 
	 */
	function createElem($elem, $value, $parent, $dom)
	{
		if (!isset($value)) $value = '';
		
		$new_elem = $dom->createElement($elem);
		$new_elem = $parent->appendChild($new_elem);
		$new_elem->appendChild($dom->createTextNode($value));
		
		return $new_elem;
	}
}

