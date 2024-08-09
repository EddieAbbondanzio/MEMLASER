import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:memlaser/src/api/exceptions.dart';
import 'package:memlaser/src/api/services/snapshot_service.dart';
import 'package:memlaser/src/app.dart';
import 'package:provider/provider.dart';
import 'package:memlaser/src/core/acknowledge_error_dialog.dart';

class ImportSnapshotButton extends StatelessWidget {
  const ImportSnapshotButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SnapshotService>(
        builder: (context, snapshotService, child) {
      onPressed() async {
        FilePickerResult? result = await FilePicker.platform.pickFiles();

        if (result != null) {
          File file = File(result.files.single.path!);

          try {
            await snapshotService.importSnapshot(file.path);
          } on ApiException catch (e) {
            showDialog(
                context: navigatorKey.currentContext!,
                builder: (BuildContext context) {
                  return AcknowledgeErrorDialog(
                      title: e.title, message: e.message);
                });
          }
        }
      }

      return FilledButton(
          style: FilledButton.styleFrom(
            textStyle:
                const TextStyle(fontSize: 12.0, fontWeight: FontWeight.bold),
            backgroundColor: Colors.blue,
            padding: const EdgeInsets.all(8.0),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4.0)),
          ),
          onPressed: onPressed,
          child: const Text(
            "Import",
          ));
    });
  }
}
