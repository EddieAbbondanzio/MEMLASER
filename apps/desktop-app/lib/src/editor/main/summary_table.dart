import 'package:flutter/material.dart';

class SummaryTable extends StatelessWidget {
  const SummaryTable({super.key});

  @override
  Widget build(BuildContext context) {
    // Rendering a table within SingleChildScrollView, but as long as we are
    // careful with keeping the # of rows within reason we should be okay.
    // Docs: https://api.flutter.dev/flutter/material/DataTable-class.html#material.DataTable.1
    return SingleChildScrollView(
        child: DataTable(
      columns: const <DataColumn>[
        DataColumn(
          label: Text('Name'),
        ),
        DataColumn(
          label: Text('Age'),
        ),
        DataColumn(
          label: Text('Role'),
        ),
      ],
      rows: const [
        DataRow(cells: [
          DataCell(Text('Foo8')),
          DataCell(Text('3')),
          DataCell(Text('Master')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar4')),
          DataCell(Text('25')),
          DataCell(Text('Pupil')),
        ]),
        DataRow(cells: [
          DataCell(Text('Foo5')),
          DataCell(Text('3')),
          DataCell(Text('Teacher')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar6')),
          DataCell(Text('54')),
          DataCell(Text('Student')),
        ]),
        DataRow(cells: [
          DataCell(Text('Foo7')),
          DataCell(Text('37')),
          DataCell(Text('Blah')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar1')),
          DataCell(Text('5')),
          DataCell(Text('Blah')),
        ]),
        DataRow(cells: [
          DataCell(Text('Foo2')),
          DataCell(Text('83')),
          DataCell(Text('Officer')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar3')),
          DataCell(Text('59')),
          DataCell(Text('Dog')),
        ]),
        DataRow(cells: [
          DataCell(Text('Foo8')),
          DataCell(Text('3')),
          DataCell(Text('Master')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar4')),
          DataCell(Text('25')),
          DataCell(Text('Pupil')),
        ]),
        DataRow(cells: [
          DataCell(Text('Foo65')),
          DataCell(Text('3')),
          DataCell(Text('Teacher')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar86')),
          DataCell(Text('54')),
          DataCell(Text('Student')),
        ]),
        DataRow(cells: [
          DataCell(Text('Foo97')),
          DataCell(Text('37')),
          DataCell(Text('Blah')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar81')),
          DataCell(Text('5')),
          DataCell(Text('Blah')),
        ]),
        DataRow(cells: [
          DataCell(Text('Foo27')),
          DataCell(Text('83')),
          DataCell(Text('Officer')),
        ]),
        DataRow(cells: [
          DataCell(Text('Bar63')),
          DataCell(Text('59')),
          DataCell(Text('Dog')),
        ]),
      ],
      dataRowMaxHeight: 49,
    ));
  }
}
