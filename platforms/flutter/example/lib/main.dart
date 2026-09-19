import 'package:flutter/material.dart';
import 'package:quiet_material/quiet_material.dart';

void main() => runApp(const QuietExample());

class QuietExample extends StatelessWidget {
  const QuietExample({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Quiet Material',
    debugShowCheckedModeBanner: false,
    theme: quietMaterialTheme(),
    builder: (context, child) => QuietRoot(child: child ?? const SizedBox.shrink()),
    home: const ExampleWorkspace(),
  );
}

class ExampleWorkspace extends StatefulWidget {
  const ExampleWorkspace({super.key});
  @override
  State<ExampleWorkspace> createState() => _ExampleWorkspaceState();
}

class _ExampleWorkspaceState extends State<ExampleWorkspace> {
  int selected = 0;
  bool notifications = true;
  final workspaceName = TextEditingController();
  static const titles = ['Overview', 'Activity', 'Settings'];

  @override
  void dispose() {
    workspaceName.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => QuietAdaptiveScaffold(
    title: 'Quiet Material',
    destinations: const [
      QuietDestination(label: 'Overview', icon: Icons.home_outlined),
      QuietDestination(label: 'Activity', icon: Icons.inbox_outlined),
      QuietDestination(label: 'Settings', icon: Icons.settings_outlined),
    ],
    selectedIndex: selected,
    onDestinationSelected: (value) => setState(() => selected = value),
    supportingPane: const Card(child: Padding(
      padding: EdgeInsets.all(QuietTokens.space6),
      child: Text('Focus on one action at a time. Supporting detail moves here when space allows.'),
    )),
    body: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Semantics(header: true, child: QuietStateChange(child: Text(
        titles[selected],
        key: ValueKey(selected),
        style: Theme.of(context).textTheme.displaySmall,
      ))),
      const SizedBox(height: QuietTokens.space6),
      if (selected == 0) Card(child: Padding(
        padding: const EdgeInsets.all(QuietTokens.space6),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Space to think.', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: QuietTokens.space3),
          const Text('A black canvas. Clear content. Just enough motion.'),
          const SizedBox(height: QuietTokens.space6),
          FilledButton(onPressed: () => setState(() => selected = 2), child: const Text('Personalize')),
        ]),
      )),
      if (selected == 1) const Card(child: Padding(
        padding: EdgeInsets.all(QuietTokens.space6),
        child: Text('You are all caught up. New activity will appear here.'),
      )),
      if (selected == 2) Card(child: Padding(
        padding: const EdgeInsets.all(QuietTokens.space5),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          TextField(
            controller: workspaceName,
            decoration: const InputDecoration(labelText: 'Workspace name', helperText: 'Choose a memorable name'),
            textInputAction: TextInputAction.done,
          ),
          const SizedBox(height: QuietTokens.space4),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Notifications'),
            value: notifications,
            onChanged: (value) => setState(() => notifications = value),
          ),
          const SizedBox(height: QuietTokens.space4),
          const Text('Preferences in this example last for this session only.'),
        ]),
      )),
    ]),
  );
}
