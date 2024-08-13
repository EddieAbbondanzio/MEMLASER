import 'package:flutter/material.dart';

class AcknowledgeErrorDialog extends StatelessWidget {
  final String title;
  final String message;
  final Function? onOk;

  const AcknowledgeErrorDialog(
      {super.key, required this.title, required this.message, this.onOk});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
            onPressed: () {
              Navigator.pop(context);
              if (onOk != null) {
                onOk!();
              }
            },
            child: const Text("Ok"))
      ],
    );
  }
}
