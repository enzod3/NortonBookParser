# NortonBookParser

This code is designed to scrape books off of the norton website and generate notes of the textbook. This can be useful for students who want to create a study guide or review the material more efficiently.

To use the code, you will need to input your own PHPSESSID cookie. To get this cookie, you will need to login to https://digital.wwnorton.com and retrieve it from your browser's cookies. Once you have the PHPSESSID, input it into the code in the designated spot. 

You can also specify which chapters you want to scrape by adjusting the start_chapter and end_chapter variables. The default bookURL is set to "https://digital.wwnorton.com/ebooks/epub/givemeliberty6brv1/EPUB/content/", but make sure you have access to the book and that the URL is in the correct format.

To run the code, use the command `npm start` in your terminal. The generated notes will be saved in a file called "chapters.txt" and the terms from the book will be saved in "terms.txt" in the same directory as the code.
