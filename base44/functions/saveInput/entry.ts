
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { session_id, input_data, platform } = body;

    if (!session_id) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Save new input if provided
    if (input_data) {
      await base44.asServiceRole.entities.SavedInput.create({
        session_id,
        input_data,
        platform: platform || ''
      });
    }

    // Retrieve all saved inputs for this session
    const saved = await base44.asServiceRole.entities.SavedInput.filter(
      { session_id },
      '-created_date',
      10
    );

    // Keep only the last 4, delete older ones
    const toKeep = saved.slice(0, 4);
    const toDelete = saved.slice(4);
    for (const item of toDelete) {
      await base44.asServiceRole.entities.SavedInput.delete(item.id);
    }

    return Response.json({ saved: toKeep });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});