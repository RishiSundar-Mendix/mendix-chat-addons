# Report export for a Mendix agent: Excel, Word and PDF files from chat

Lets an agent turn data it has just read into a downloadable Excel, Word or PDF file. The user says "give me all the details of equipment E-17 as an Excel report". The agent calls its normal read tools, then calls one export tool with the data. The user gets a file.

The agent never writes the file itself. It sends structured content (sections with headers and rows) and a Java action builds the file. The values come from tool results, so the file only contains what the user is allowed to see.

## Parts
| Part | What it is |
|---|---|
| Entity `GeneratedReport` | A specialization of `System.FileDocument` (fields: `ReportTitle`, `ReportFormat`). Access for the user role. |
| Java action `JA_BuildReportFile` | Parameters: `Report` (object, `GeneratedReport`), `Format` (String), `Title` (String), `ContentJson` (String). Returns String: empty when the file was built, otherwise a plain-language problem. File `JA_BuildReportFile.java` in this folder. |
| Microflow `ACT_ExportReport` | Parameters: `Format`, `Title`, `ContentJson` (all String). Returns String. See the steps below. |
| Agent tool `export_report` | Calls `ACT_ExportReport`. User access: hidden for user (it only reads and builds a file). |
| Prompt section | See `prompt-section.txt` in this folder. |

## Libraries (copy the jars into `userlib`)
- Apache POI: `poi`, `poi-ooxml` (Excel and Word). The Advanced Excel module already contains them.
- OpenPDF (`com.github.librepdf:openpdf`, for PDF).
- Jackson databind (JSON). Already present with several Marketplace modules.

## Build steps
1. Create the entity `GeneratedReport` (generalization `System.FileDocument`, attributes `ReportTitle`, `ReportFormat`), and give your user role create, read and delete access.
2. In Studio Pro create the Java action `JA_BuildReportFile` with the four parameters above (return type String, exposed as a microflow action). Studio Pro generates the stub. Replace its code with `JA_BuildReportFile.java` from this folder, keeping the import list and the user code block.
3. Create the microflow `ACT_ExportReport(Format, Title, ContentJson) : String`:
   1. Create object `GeneratedReport` as `Report` (no commit).
   2. Call Java action `JA_BuildReportFile` with `$Report`, `$Format`, `$Title`, `$ContentJson`. Output `Problem` (String).
   3. Decision `$Problem = ''`. False: end and return `$Problem`.
   4. True: Commit `$Report`, then Download File `$Report`, then end and return `'The file ' + $Report/Name + ' was created and the download has started.'`
4. In the agent, add a microflow tool `export_report` for `ACT_ExportReport`, user access hidden for user, with the description in `tool-description.txt`.
5. Add the prompt section from `prompt-section.txt` to the system prompt.
6. Create a new agent version and set it in use.

## Content format
```json
{
  "subtitle": "Site, what is included",
  "sections": [
    {
      "heading": "Queue",
      "text": "optional one line",
      "headers": ["Sequence", "Order code", "Status"],
      "rows": [[1, "ORD-001", "In progress"], [2, "ORD-002", "Ready"]]
    }
  ]
}
```
- Excel: one sheet per section, styled header row, numbers stay numbers.
- Word: title, headings and tables.
- PDF: landscape A4, headings and shaded header rows.

## Safety notes
- Tell the model in the prompt to copy values exactly from tool results and never invent any. The file is only as correct as the data the model sends.
- Function microflows run in the user's context but without entity access, so every read tool should filter by the current user (XPath on `$currentUser`).
- Keep file sizes small. The action has no paging for very long tables.

## Tested
- Excel and PDF were tested end to end through an agent chat. The Word path is built but has had less testing. Test all three formats in your app before relying on them.

## License
MIT. See the LICENSE file in the repository root.
