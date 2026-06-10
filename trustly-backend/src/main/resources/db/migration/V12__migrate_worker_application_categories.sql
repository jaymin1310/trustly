UPDATE worker_applications wa
SET category_id = sc.id
    FROM service_categories sc
WHERE wa.category = 'ELECTRICIAN'
  AND sc.name = 'Electrician';

UPDATE worker_applications wa
SET category_id = sc.id
    FROM service_categories sc
WHERE wa.category = 'PLUMBER'
  AND sc.name = 'Plumber';

UPDATE worker_applications wa
SET category_id = sc.id
    FROM service_categories sc
WHERE wa.category = 'CLEANER'
  AND sc.name = 'Cleaner';

UPDATE worker_applications wa
SET category_id = sc.id
    FROM service_categories sc
WHERE wa.category = 'PAINTER'
  AND sc.name = 'Painter';

UPDATE worker_applications wa
SET category_id = sc.id
    FROM service_categories sc
WHERE wa.category = 'CARPENTER'
  AND sc.name = 'Carpenter';

UPDATE worker_applications wa
SET category_id = sc.id
    FROM service_categories sc
WHERE wa.category = 'AC_REPAIR'
  AND sc.name = 'AC Repair';