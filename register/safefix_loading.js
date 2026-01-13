
import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/Yug Mittal/Downloads/sb1-oxmztjcs/register/src/App.tsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    // Find the onSnapshot block
    // We want to wrap the logic inside `(docSnapshot) => {` in a try/catch

    let startIdx = -1;
    let endIdx = -1;

    // Search for the line with `const unsubDb = onSnapshot(`
    // and the specific callback signature
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const unsubDb = onSnapshot(doc(db, "appData", user.uid), (docSnapshot) => {')) {
            startIdx = i;
        }
        // Match the closing brace of the callback, which now has the error handler attached
        if (startIdx !== -1 && i > startIdx) {
            if (lines[i].includes('}, (error) => {')) {
                endIdx = i;
                break;
            }
        }
    }

    if (startIdx !== -1 && endIdx !== -1) {
        console.log(`Found onSnapshot block from ${startIdx} to ${endIdx}`);

        // Extract the inner content (excluding the first and last lines mechanism for now)
        // Actually, easiest is to construct the NEW content for the whole block

        const newBlock = `    const unsubDb = onSnapshot(doc(db, "appData", user.uid), (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          // store doc id for diagnostics / admin contact display
          setFbDocId(docSnapshot.id);
          const cloudData = docSnapshot.data();
          if (!cloudData.settings) cloudData.settings = defaultData.settings;
          if (!cloudData.settings.pinnedTools) cloudData.settings.pinnedTools = [];
          if (!cloudData.settings.shopName) cloudData.settings.shopName = 'Autonex';
          if (!cloudData.appStatus) cloudData.appStatus = 'active';

          if (!Array.isArray(cloudData.pages)) cloudData.pages = [];
          if (!Array.isArray(cloudData.entries)) cloudData.entries = [];
          if (!Array.isArray(cloudData.bills)) cloudData.bills = [];
          if (!cloudData.settings.productPassword) cloudData.settings.productPassword = '0000';

          if (cloudData.settings.limit) setTempLimit(cloudData.settings.limit);

          // Merge transient local state (previewUrl, uploading/progress/tempBlob, uploadFailed)
          const localBills = (dataRef.current && dataRef.current.bills) ? dataRef.current.bills : [];
          const localMap = new Map(localBills.map((b: any) => [b.id, b]));

          const mergedBills = (cloudData.bills || []).map((cb: any) => {
            const local: any = localMap.get(cb.id);
            if (!local) return cb;
            return {
              ...cb,
              previewUrl: local.previewUrl || local.image || null,
              uploading: local.uploading || false,
              progress: typeof local.progress === 'number' ? local.progress : 0,
              tempBlob: local.tempBlob,
              uploadFailed: local.uploadFailed || false
            };
          });

          // Include any local-only bills (not yet in cloud) at the front so they remain visible
          const cloudIds = new Set((cloudData.bills || []).map((b: any) => b.id));
          const localOnly = localBills.filter((b: any) => !cloudIds.has(b.id));

          const finalData = { ...cloudData, bills: [...localOnly, ...mergedBills] };

          setData(finalData);
        } else {
          setDoc(doc(db, "appData", user.uid), defaultData);
        }
      } catch (err) {
        console.error("Data Processing Error:", err);
        // Don't crash loading, just let it finish (maybe show empty?)
      } finally {
        setDbLoading(false);
      }
    }, (error) => {`;

        // Replace lines startIdx...endIdx-1 with newBlock
        // The endIdx line is `    }, (error) => {`, so we effectively replace everything INSIDE up to that closing brace line.

        // Wait, my replacement includes the opening line and the closing brace of the success callback? 
        // Yes: `const unsubDb = ...` to `, (error) => {`

        // I need to be careful about what `lines` holds.
        // `lines[startIdx]` is `    const unsubDb = onSnapshot(doc(db, "appData", user.uid), (docSnapshot) => {`
        // `lines[endIdx]` is `    }, (error) => {`

        // So I replace range [startIdx, endIdx] (inclusive of start, exclusive of end?)
        // If I include `}, (error) => {` in newBlock I should replace up to endIdx.

        // `lines.splice(startIdx, endIdx - startIdx, newBlock)` replacing the whole chunk.
        // However `newBlock` is a STRING. `splice` expects separate args/lines if I want array.
        // Ah, I can join `newBlock` but `splice` inserts elements.

        const newLines = newBlock.split('\n');

        // Remove old lines
        lines.splice(startIdx, endIdx - startIdx);

        // Insert new lines
        lines.splice(startIdx, 0, ...newLines);

        fs.writeFileSync(filePath, lines.join('\n'));
        console.log('App.tsx updated safely with try/catch');
    } else {
        console.error('Could not find onSnapshot block to wrap.');
    }

} catch (error) {
    console.error('Error:', error);
    process.exit(1);
}
